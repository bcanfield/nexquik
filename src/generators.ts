import { DMMF } from "@prisma/generator-helper";
import { getDMMF } from "@prisma/internals";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import {
  convertRouteToRedirectUrl,
  copyAndRenameFile,
  copyDirectory,
  findAndReplaceInFiles,
  getDynamicSlugs,
  popStringEnd,
} from "./helpers";
import {
  ModelTree,
  createModelTree,
  getParentReferenceField,
} from "./modelTree";

const readFileAsync = promisify(fs.readFile);

interface RouteSegment {
  segment: string;
  fullRoute: string;
}

function splitTheRoute(route: string): RouteSegment[] {
  const segments = route.split("/").filter((r) => r != "");
  // console.log({ segments });
  let currentRoute = "";

  const returnSegs = segments.flatMap((segment) => {
    let newSegment = segment;
    if (segment) {
      if (segment.includes("[")) {
        currentRoute += "/$" + segment.replace(/\[(.*?)\]/g, "{params.$1}");
        newSegment = segment.replace(/\[(.*?)\]/g, "{params.$1}");
      } else {
        currentRoute += `/${segment}`;
      }
      return { segment: newSegment, fullRoute: currentRoute };
    }
    return [];
  });
  return returnSegs;
  // .filter(Boolean);
}
function generateBreadCrumb(route: string) {
  let routeCrumbs = "";
  splitTheRoute(route).forEach(({ segment, fullRoute }) => {
    routeCrumbs += `
      
       <li>
          <div class="flex items-center">
            <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
            </svg>
            <Link href={\`${fullRoute}\`} class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">${segment}</Link>
          </div>
        </li>`;
  });
  const breadCrumb = `
    <nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
    <li class="inline-flex items-center">
    <Link href="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
      <svg class="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
      </svg>
      Home
    </Link>
  </li>
       ${routeCrumbs}

        </ol>
      </nav>

      `;
  return breadCrumb;
}

export const prismaFieldToInputType: Record<string, string> = {
  Int: "number",
  Float: "number",
  String: "text",
  Boolean: "checkbox",
  DateTime: "datetime-local",
  Json: "text",
};

export interface RouteObject {
  segment: string;
  model: string;
  operation: string;
  description: string;
}

function addStringBetweenComments(
  directory: string,
  insertString: string,
  startComment: string,
  endComment: string
): void {
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);

    // Check if the file is a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively process subdirectories
      addStringBetweenComments(
        filePath,
        insertString,
        startComment,
        endComment
      );
    } else {
      // Read file contents
      let fileContent = fs.readFileSync(filePath, "utf8");
      // Check if both comments exist in the file
      while (
        fileContent.includes(startComment) &&
        fileContent.includes(endComment)
      ) {
        // Replace the content between the comments and the comments themselves with the insert string
        const startIndex = fileContent.indexOf(startComment);
        const endIndex = fileContent.indexOf(endComment) + endComment.length;
        const contentToRemove = fileContent.slice(startIndex, endIndex);
        fileContent = fileContent.replace(contentToRemove, insertString);
      }
      // Write the modified content back to the file
      fs.writeFileSync(filePath, fileContent);
    }
  });
}

async function generateCreateForm(
  modelTree: ModelTree,
  routeUrl: string,
  enums: Record<string, string[]>
): Promise<string> {
  const formFields = generateFormFields(modelTree, enums);
  const reactComponentTemplate = `
      <form className="space-y-4" action={addNexquikTemplateModel}>
        ${formFields}
        <div className="flex space-x-4">
        <button type="submit"                   className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
        >
            Create NexquikTemplateModel
        </button>
        <Link href={\`${routeUrl}\`} className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors" passHref>
        Cancel
        </Link>
    </div>      
    </form>     
  `;

  return reactComponentTemplate;
}

async function generateRedirect(redirectUrl: string): Promise<string> {
  const reactComponentTemplate = `
    redirect(${redirectUrl});
  `;
  return reactComponentTemplate;
}

async function generateLink(
  linkUrl: string,
  linkText: string
): Promise<string> {
  const linkString = linkUrl ? `\`${linkUrl}\`` : "'/'";
  const reactComponentTemplate = `
  <Link href={${linkString}} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">
  ${linkText}
</Link>  `;
  return reactComponentTemplate;
}

async function generateRevalidatePath(
  revalidationUrl: string
): Promise<string> {
  const reactComponentTemplate = `
    revalidatePath(\`${revalidationUrl}\`);
  `;
  return reactComponentTemplate;
}

async function generateEditForm(
  modelTree: ModelTree,
  routeUrl: string,
  enums: Record<string, string[]>
): Promise<string> {
  // const tableFields = await extractTableFields(tableName, prismaSchema);
  const formFields = generateFormFieldsWithDefaults(
    modelTree.model.fields,
    enums
  );
  // Define the React component template as a string
  const reactComponentTemplate = `
  <form className="space-y-4" action={editNexquikTemplateModel}>
  ${formFields}
  <div className="flex space-x-4">
        <button  className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors" type="submit">Update NexquikTemplateModel</button>
        <Link href={\`${routeUrl}\`} className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors" passHref>
            Cancel
        </Link>
        </div>
      </form>
  `;

  return reactComponentTemplate;
}
``;
function getEnums(datamodel: DMMF.Datamodel): Record<string, string[]> {
  const enums: Record<string, string[]> = {};

  for (const enumDef of datamodel.enums) {
    const enumName = enumDef.name;
    const enumValues = enumDef.values.map((value) => value.name);
    enums[enumName] = enumValues;
  }

  return enums;
}
async function generateChildrenList(
  modelTree: ModelTree,
  routeUrl: string
): Promise<string> {
  // Define the React component template as a string
  const slug = getDynamicSlugs(
    modelTree.model.name,
    modelTree.uniqueIdentifierField.map((f) => f.name)
  );
  const childrenLinks: string[] = [];
  modelTree.children.forEach((c) => {
    let childLink = `<div className="w-1/3"> <Link className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors block w-full text-center" href={\`${routeUrl}/`;
    slug.forEach((s) => {
      childLink += `\${params.${s}}/`;
    });

    childLink += `${
      c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)
    }\`}>
  ${c.modelName} List
</Link></div>`;
    childrenLinks.push(childLink);
  });
  return childrenLinks.join("\n");
}
async function generateListForm(
  modelTree: ModelTree,
  routeUrl: string,
  uniqueFields: {
    name: string;
    type: string;
  }[]
): Promise<string> {
  let linkHref = routeUrl;
  uniqueFields.forEach((f) => {
    linkHref += "/" + "${" + "nexquikTemplateModel." + f.name + "}";
  });

  let uniqueFormInputs = "";
  uniqueFields.forEach((u) => {
    uniqueFormInputs += `<input hidden type="${
      prismaFieldToInputType[u.type]
    }" name="${u.name}" value={nexquikTemplateModel.${u.name}} readOnly/>`;
  });

  // Define the React component template as a string
  const reactComponentTemplate = `
  <table className="w-full text-left border-collapse">
  <thead>

  <tr>
  ${modelTree.model.fields
    .map((field) => {
      if (isFieldRenderable(field)) {
        return `<th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300"> ${field.name} </th>`;
      }
    })
    .join("\n")}
  </tr>
  </thead>
  <tbody>

    {nexquikTemplateModel?.map((nexquikTemplateModel, index) => (
      <tr key={index}>
      
      ${modelTree.model.fields
        .map((field) => {
          if (isFieldRenderable(field)) {
            return `<td  translate="no"
            className="py-2 pr-2 font-mono font-medium text-sm leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400"> {\`\${nexquikTemplateModel.${field.name}}\`} </td>`;
          }
        })
        .join("\n")}

      <td className="action-cell">
      <form className="flex space-x-2">
      ${uniqueFormInputs}
          <Link href={\`${linkHref}\`} className="text-blue-500 hover:text-blue-600 transition-colors">View</Link>
                  <Link href={\`${linkHref}/edit\`} className="text-green-500 hover:text-green-600 transition-colors">Edit</Link>
                  <button formAction={deleteNexquikTemplateModel} className="text-red-500 hover:text-red-600 transition-colors">Delete</button>
                  </form>

                  </td>
      </tr>
  
    ))}
    </tbody>
    </table>
    `;

  return reactComponentTemplate;
}

export async function generate(
  prismaSchemaPath: string,
  outputDirectory: string
) {
  // Read the Prisma schema file
  console.log(chalk.blue("Locating Prisma Schema File"));
  const prismaSchema = await readFileAsync(prismaSchemaPath, "utf-8");

  // Create the output directory
  console.log(chalk.blue("Creating output directory"));
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true });
  }
  fs.mkdirSync(outputDirectory);

  // Create the app directory
  const appDirectory = path.join(outputDirectory, "app");
  fs.mkdirSync(appDirectory);

  // Main section to build the app from the modelTree
  console.log(chalk.blue("Reading Prisma Schema"));
  const dmmf = await getDMMF({ datamodel: prismaSchema });

  console.log(chalk.blue("Creating Tree"));

  // Create model tree and verify there is at least one valid model
  const modelTree = createModelTree(dmmf.datamodel);
  if (modelTree.length === 0) {
    console.log(chalk.red("Nexquik Error: No valid models detected in schema"));
    throw new Error("Nexquik Error: No valid models detected in schema");
  }

  // Copy all files from the root dir except for app. (package.json, next.config, etc)
  copyDirectory(
    path.join(__dirname, "templateRoot"),
    outputDirectory,
    true,
    "app"
  );

  // Copy over the user's prisma schema and rename it to schema.prisma
  copyAndRenameFile(
    prismaSchemaPath,
    path.join(outputDirectory, "prisma"),
    "schema.prisma"
  );

  console.log(
    chalk.magentaBright.bold(
      "TOP LEVEL MODEL TREE\n-------------\n",
      modelTree.map((t) => t.modelName)
    )
  );

  const enums = getEnums(dmmf.datamodel);
  console.log(chalk.blue("Generating App Directory"));
  const routes = await generateAppDirectoryFromModelTree(
    modelTree,
    appDirectory,
    enums
  );

  console.log(chalk.blue("Generating Route List"));
  const routeList = generateRouteList(routes);
  addStringBetweenComments(
    appDirectory,
    routeList,
    "{/* @nexquik routeList start */}",
    "{/* @nexquik routeList stop */}"
  );
  console.log(chalk.blue("Finishing Up"));
  return;
}

export async function generateShowForm(
  modelTree: ModelTree,
  routeUrl: string
): Promise<string> {
  const uniqueFields = modelTree.uniqueIdentifierField;

  let linkRoute = routeUrl;
  uniqueFields.forEach((f) => {
    linkRoute += `/\${nexquikTemplateModel?.${f?.name}}`;
  });
  const reactComponentTemplate = `
    <form className="space-y-4">
    ${modelTree.model.fields
      .map((field) => {
        if (!isFieldRenderable(field)) {
          return "";
        }
        let typecastValue = `nexquikTemplateModel?.${field?.name}`;
        if (field?.type === "Int" || field?.type === "Float") {
          typecastValue = `Number(${typecastValue})`;
        } else {
          typecastValue = `String(${typecastValue})`;
        }
        return `  <input hidden type="${field.type}" name="${field?.name}" defaultValue={${typecastValue}} />`;
      })
      .join("\n")}


  
     

    <div className="mt-8">

    ${modelTree.model.fields
      .map((field) => {
        if (!isFieldRenderable(field)) {
          return "";
        }
        return `<div className="grid grid-cols-2 gap-1">
      <span className="text-slate-500 dark:text-slate-400 font-medium">${field.name}</span>
      <span className="text-slate-700 dark:text-slate-300">{\`\${nexquikTemplateModel?.${field.name}}\`}</span>
  </div>`;
      })
      .join("\n")}
    </div>
    <div className="flex space-x-4">


    <Link     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"

    passHref href={\`${linkRoute}/edit\`}>Edit</Link>

  
    <button     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"

    formAction={deleteNexquikTemplateModel}>Delete</button>
    </div>
    </form>
  `;

  return reactComponentTemplate;
}

function generateRouteList(routes: RouteObject[]) {
  const routeLinks = [];
  for (const route of routes) {
    routeLinks.push(
      `
      <tr>
      <td
        translate="no"
        className="py-2 pr-2 font-mono font-medium text-sm leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400"
      >
        ${route.model}
      </td>
      <td
        translate="no"
        className="py-2 pl-2 font-mono text-sm leading-6 text-indigo-600 whitespace-pre dark:text-indigo-300 hidden sm:table-cell sm:pr-2"
      >
      ${route.operation}
      </td>
    </tr>
    
      `
    );
  }

  return `

<table className="w-full text-left border-collapse">
<thead>
  <tr>
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
      <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">
        Model
      </div>
    </th>
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300 hidden sm:table-cell">
      <div className="py-2 pl-2 border-b border-slate-200 dark:border-slate-400/20 pr-2">
        Operation
      </div>
    </th>
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
      <div className="py-2 pl-2 border-b border-slate-200 dark:border-slate-400/20">
        <span className="sr-only">Preview</span>&nbsp;
      </div>
    </th>
  </tr>
</thead>

<tbody className="align-baseline">
${routeLinks.join("\n")} 
</tbody>
</table>

`;
}

export async function generateAppDirectoryFromModelTree(
  modelTreeArray: ModelTree[],
  outputDirectory: string,
  enums: Record<string, string[]>
): Promise<RouteObject[]> {
  const routes: RouteObject[] = [];

  async function generateRoutes(
    modelTree: ModelTree,
    parentRoute: {
      name: string;
      uniqueIdentifierField: { name: string; type: string }[];
    }
  ) {
    // Get the current model name
    const modelName = modelTree.modelName;

    // Get the current mode'ls array of prisma unique id fields
    const modelUniqueIdentifierField = modelTree.uniqueIdentifierField;

    let route = parentRoute.name;

    if (route === "/") {
      // Copy over the files in the template app dir, skipping the model directory. (globals.css, layout.tsx, page.tsx)
      copyDirectory(
        path.join(__dirname, "templateRoot", "app"),
        outputDirectory,
        false,
        "nexquikTemplateModel"
      );
    }
    route += modelName.charAt(0).toLowerCase() + modelName.slice(1) + "/";
    routes.push({
      segment: `${route}create`,
      model: modelName,
      operation: "Create",
      description: `Create a ${modelName}`,
    });

    // List
    routes.push({
      segment: route,
      model: modelName,
      operation: "List",
      description: `Get a list of ${modelName}s`,
    });
    let splitRoute = "";
    const slugss = getDynamicSlugs(
      modelName,
      modelTree.uniqueIdentifierField.map((f) => f.name)
    );
    slugss.forEach((s) => {
      splitRoute += `[${s}]`;
    });

    routes.push({
      segment: `${route}${splitRoute}/edit`,
      model: modelName,
      operation: "Edit",
      description: `Edit a ${modelName} by ID`,
    });

    // Show
    routes.push({
      segment: `${route}${splitRoute}`,
      model: modelName,
      operation: "Show",
      description: `Get details of a ${modelName} by ID`,
    });

    const baseRoute = route;
    const createRedirectForm = convertRouteToRedirectUrl(baseRoute);

    // Create base directory for this model under the app dir
    const baseModelDirectory = path.join(outputDirectory, route);
    const baseParts = baseModelDirectory
      .split(path.sep)
      .filter((item) => item !== "");

    let currentBasePath = "";
    for (const part of baseParts) {
      currentBasePath = path.join(currentBasePath, part);
      if (!fs.existsSync(currentBasePath)) {
        fs.mkdirSync(currentBasePath);
      }
    }

    if (baseModelDirectory !== "app/") {
      // Copy files from template model, skipping dynamic directory. (create/, page.tsx)
      copyDirectory(
        path.join(__dirname, "templateRoot", "app", "nexquikTemplateModel"),
        baseModelDirectory,
        true,
        "[id]"
      );
    }

    const createBreadCrumb = generateBreadCrumb(route + "/create");

    addStringBetweenComments(
      path.join(baseModelDirectory),
      createBreadCrumb,
      "{/* @nexquik createBreadcrumb start */}",
      "{/* @nexquik createBreadcrumb stop */}"
    );

    const listBreadCrumb = generateBreadCrumb(route);

    addStringBetweenComments(
      baseModelDirectory,
      listBreadCrumb,
      "{/* @nexquik listBreadcrumb start */}",
      "{/* @nexquik listBreadcrumb stop */}"
    );

    // Create dynamic directories
    const slugsForThisModel = getDynamicSlugs(
      modelTree.modelName,
      modelUniqueIdentifierField.map((f) => f.name)
    );
    slugsForThisModel.forEach((parentSlug) => {
      route += `[${parentSlug}]/`;
    });
    const dynamicOutputDirectory = path.join(outputDirectory, route);
    const parts = dynamicOutputDirectory
      .split(path.sep)
      .filter((item) => item !== "");
    let currentPath = "";
    for (const part of parts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }

    // Copy template dynamic directory into new dynamic directory
    copyDirectory(
      path.join(
        __dirname,
        "templateRoot",
        "app",
        "nexquikTemplateModel",
        "[id]"
      ),
      dynamicOutputDirectory,
      true
    );

    const uniqueDynamicSlugs = getDynamicSlugs(
      modelTree.modelName,
      modelUniqueIdentifierField.map((f) => f.name)
    );

    // ############### List Page
    const listFormCode = await generateListForm(
      modelTree,
      createRedirectForm,
      modelUniqueIdentifierField
    );
    addStringBetweenComments(
      baseModelDirectory,
      listFormCode,
      "{/* @nexquik listForm start */}",
      "{/* @nexquik listForm stop */}"
    );

    // Get relation fields to parent
    let relationFieldToParent = "";
    let fieldType = "";
    if (modelTree.parent) {
      // Get the field on the current model that is the id referencing the parent
      modelTree.model.fields.forEach((mf) => {
        if (mf.type === modelTree.parent?.name) {
          if (
            mf.relationFromFields?.length &&
            mf.relationFromFields.length > 0
          ) {
            relationFieldToParent = mf.relationFromFields[0];
          }
        }
      });

      // Get the field type on the current model that is the id referencing the parent
      fieldType =
        modelTree.model.fields.find((f) => f.name === relationFieldToParent)
          ?.type || "";
    }
    const parentIdentifierFields = modelTree.model.fields.find((field) =>
      field.relationFromFields?.includes(relationFieldToParent)
    )?.relationToFields;
    let parentIdentifierField = "";
    if (parentIdentifierFields && parentIdentifierFields.length > 0) {
      parentIdentifierField = parentIdentifierFields[0];
    }

    // Delete Where Clause
    const deleteWhereClause = generateDeleteClause(modelUniqueIdentifierField);
    addStringBetweenComments(
      baseModelDirectory,
      deleteWhereClause,
      "//@nexquik prismaDeleteClause start",
      "//@nexquik prismaDeleteClause stop"
    );
    const listRedirect = await generateRedirect(`\`${createRedirectForm}\``);
    addStringBetweenComments(
      baseModelDirectory,
      listRedirect,
      "//@nexquik listRedirect start",
      "//@nexquik listRedirect stop"
    );

    // In parent, loop through fields and find field of 'type' current model
    let isManyToMany = false;
    let referenceFieldNameToParent = "";
    const parentIdField = modelTree.parent?.fields.find((f) => f.isId);
    const relationNameToParent = modelTree.parent?.fields.find(
      (a) => a.type === modelTree.modelName
    )?.relationName;
    if (relationNameToParent) {
      const referenceFieldToParent = modelTree.model.fields.find(
        (f) => f.relationName === relationNameToParent
      );
      if (referenceFieldToParent) {
        referenceFieldNameToParent = referenceFieldToParent.name;
      }
      if (referenceFieldToParent?.isList) {
        isManyToMany = true;
      }
    }
    let manyToManyWhere = "";
    let manyToManyConnect = "";
    if (isManyToMany && parentIdField) {
      let typecastValue = `params.${getDynamicSlugs(modelTree.parent?.name, [
        parentIdField.name,
      ])}`;
      if (parentIdField?.type === "Int" || parentIdField?.type === "Float") {
        typecastValue = `Number(${typecastValue})`;
      } else if (parentIdField?.type === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      } else if (parentIdField?.type === "String") {
        typecastValue = `String(${typecastValue})`;
      }
      manyToManyWhere = `
    where: {
      ${referenceFieldNameToParent}: {
        some: {
          ${parentIdField?.name}: {
            equals: ${typecastValue}
          }
        }
      }
    }
    `;

      manyToManyConnect = `
      ${referenceFieldNameToParent}: {
      connect: {
        ${parentIdField?.name}: ${typecastValue},
      },
    },
    `;
    }

    // Unique field on parent, that points to this model
    const parentReferenceField = getParentReferenceField(modelTree);
    const relationsToParent = modelTree.model.fields.find(
      (f) => f.name === parentReferenceField
    )?.relationToFields;

    const parentReferenceFieldType = modelTree.parent?.fields.find(
      (f) => relationsToParent && relationsToParent[0] === f.name
    )?.type;

    const whereparentClause = modelTree.parent
      ? generateWhereParentClause(
          "params",
          getDynamicSlugs(modelTree.parent.name, [parentIdentifierField])[0],
          relationsToParent ? relationsToParent[0] : parentIdentifierField,
          parentReferenceFieldType || fieldType,
          getParentReferenceField(modelTree),
          manyToManyWhere
        )
      : "()";

    // Enum import for create and edit pages
    const enumImport = Object.keys(enums)
      .map((e) => `import { ${e} } from "@prisma/client";`)
      .join("\n");

    addStringBetweenComments(
      baseModelDirectory,
      enumImport,
      "//@nexquik prismaEnumImport start",
      "//@nexquik prismaEnumImport stop"
    );

    addStringBetweenComments(
      baseModelDirectory,
      whereparentClause,
      "//@nexquik prismaWhereParentClause start",
      "//@nexquik prismaWhereParentClause stop"
    );

    // ############### Show Page
    const showFormCode = await generateShowForm(modelTree, createRedirectForm);
    addStringBetweenComments(
      baseModelDirectory,
      showFormCode,
      "{/* @nexquik showForm start */}",
      "{/* @nexquik showForm stop */}"
    );
    const childModelLinkList = await generateChildrenList(
      modelTree,
      createRedirectForm
    );
    addStringBetweenComments(
      baseModelDirectory,
      childModelLinkList,
      "{/* @nexquik listChildren start */}",
      "{/* @nexquik listChildren stop */}"
    );

    // If many to many, must do a connect
    const createFormCode = await generateCreateForm(
      modelTree,
      createRedirectForm,
      enums
    );
    addStringBetweenComments(
      baseModelDirectory,
      createFormCode,
      "{/* @nexquik createForm start */}",
      "{/* @nexquik createForm stop */}"
    );

    let redirectStr = "";
    modelTree.uniqueIdentifierField.forEach(
      (f) => (redirectStr += "/" + `\${created.${f.name}}`)
    );
    const createRedirect = await generateRedirect(
      `\`${createRedirectForm}${redirectStr}\``
    );
    addStringBetweenComments(
      baseModelDirectory,
      createRedirect,
      "//@nexquik createRedirect start",
      "//@nexquik createRedirect stop"
    );
    const createLink = await generateLink(
      `${createRedirectForm}/create`,
      "Create New NexquikTemplateModel"
    );
    addStringBetweenComments(
      baseModelDirectory,
      createLink,
      "{/* @nexquik createLink start */}",
      "{/* @nexquik createLink stop */}"
    );
    const prismaInput = generateConvertToPrismaInputCode(modelTree);
    addStringBetweenComments(
      baseModelDirectory,
      prismaInput,
      "//@nexquik prismaEditDataInput start",
      "//@nexquik prismaEditDataInput stop"
    );

    const parentSlugs = getDynamicSlugs(
      modelTree.parent?.name,
      parentRoute.uniqueIdentifierField.map((f) => f.name)
    );

    const prismaCreateInput = generateConvertToPrismaCreateInputCode(
      modelTree,
      parentSlugs,
      manyToManyConnect
    );
    addStringBetweenComments(
      baseModelDirectory,
      prismaCreateInput,
      "//@nexquik prismaCreateDataInput start",
      "//@nexquik prismaCreateDataInput stop"
    );

    const whereClause = generateWhereClause(
      "params",
      uniqueDynamicSlugs,
      modelUniqueIdentifierField
    );
    addStringBetweenComments(
      baseModelDirectory,
      whereClause,
      "//@nexquik prismaWhereInput start",
      "//@nexquik prismaWhereInput stop"
    );

    // ############### Edit Page
    const editFormCode = await generateEditForm(
      modelTree,
      createRedirectForm,
      enums
    );
    addStringBetweenComments(
      baseModelDirectory,
      editFormCode,
      "{/* @nexquik editForm start */}",
      "{/* @nexquik editForm stop */}"
    );

    let redirectStr2 = "";
    uniqueDynamicSlugs.forEach(
      (f) => (redirectStr2 += "/" + `\${params.${f}}`)
    );

    const editRedirect = await generateRedirect(
      `\`${createRedirectForm}/${redirectStr2}\``
    );
    addStringBetweenComments(
      baseModelDirectory,
      editRedirect,
      "//@nexquik editRedirect start",
      "//@nexquik editRedirect stop"
    );

    // ############### Extras
    const revalidatePath = await generateRevalidatePath(
      `${createRedirectForm}`
    );
    addStringBetweenComments(
      baseModelDirectory,
      revalidatePath,
      "//@nexquik revalidatePath start",
      "//@nexquik revalidatePath stop"
    );

    const backLink = await generateLink(
      popStringEnd(popStringEnd(`${createRedirectForm}`, "/"), "/"),
      "Back"
    );
    addStringBetweenComments(
      baseModelDirectory,
      backLink,
      "{/* @nexquik backLink start */}",
      "{/* @nexquik backLink stop */}"
    );

    const backToCurrent = await generateLink(`${createRedirectForm}`, "Back");
    addStringBetweenComments(
      baseModelDirectory,
      backToCurrent,
      "{/* @nexquik backToCurrentLink start */}",
      "{/* @nexquik backToCurrentLink stop */}"
    );

    const baseBreadCrumb = generateBreadCrumb(route);

    addStringBetweenComments(
      baseModelDirectory,
      baseBreadCrumb,
      "{/* @nexquik breadcrumb start */}",
      "{/* @nexquik breadcrumb stop */}"
    );

    const editBreadCrumb = generateBreadCrumb(route + "/edit");

    addStringBetweenComments(
      path.join(baseModelDirectory),
      editBreadCrumb,
      "{/* @nexquik editBreadCrumb start */}",
      "{/* @nexquik editBreadCrumb stop */}"
    );
    // Replace all placeholder model names
    findAndReplaceInFiles(
      baseModelDirectory,
      "nexquikTemplateModel",
      modelTree.modelName
    );

    for (const child of modelTree.children) {
      await generateRoutes(child, {
        name: route,
        uniqueIdentifierField: modelUniqueIdentifierField,
      });
    }
  }

  for (const modelTree of modelTreeArray) {
    await generateRoutes(modelTree, {
      name: "/",
      uniqueIdentifierField: [],
    });
  }

  const routesListItems = routes
    .filter((r) => !r.segment.includes("["))
    .map(
      (r) => `<li>
  <a
    className="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
    href="${r.segment}"
  >
    ${r.model} - ${r.operation}
  </a>
</li>`
    )
    .join("\n");
  addStringBetweenComments(
    outputDirectory,
    routesListItems,
    "{/* //@nexquik routeSidebar start */}",
    "{/* //@nexquik routeSidebar stop */}"
  );
  return routes;
}

export function generateConvertToPrismaCreateInputCode(
  modelTree: ModelTree,
  parentSlugs: string[],
  manyToManyConnect: string
): string {
  // If model has a parent, get the parent accessor
  let relationFieldsToParent: string[] = [];
  let fieldType = "";
  if (modelTree.parent) {
    // Get the field on the current model that is the id referencing the parent
    modelTree.model.fields.forEach((mf) => {
      if (mf.type === modelTree.parent?.name) {
        if (mf.relationFromFields?.length && mf.relationFromFields.length > 0) {
          relationFieldsToParent = mf.relationFromFields;
        }
      }
    });

    // Get the field type on the current model that is the id referencing the parent
    fieldType =
      modelTree.model.fields.find((f) =>
        relationFieldsToParent.find((a) => a === f.name)
      )?.type || "";
  }

  const fieldsToConvert: Partial<DMMF.Field>[] = modelTree.model.fields
    // .filter((field) => {
    //   return field.isId !== true || field.hasDefaultValue == false;
    // })
    .filter((field) => isFieldRenderable(field));

  const convertToPrismaInputLines = fieldsToConvert.map(
    ({ name, type, kind, isRequired, hasDefaultValue }) => {
      const nonTypeCastedValue = `formData.get('${name}')`;
      let typecastValue = nonTypeCastedValue;
      if (kind === "enum") {
        typecastValue += ` as ${type}`;
      } else {
        if (type === "Int" || type === "Float") {
          typecastValue = `Number(${typecastValue})`;
        } else if (type === "Boolean") {
          typecastValue = `Boolean(${typecastValue})`;
        } else if (type === "DateTime") {
          typecastValue = `new Date(String(${typecastValue}))`;
        } else {
          typecastValue = `String(${typecastValue})`;
        }
      }
      if (hasDefaultValue || !isRequired) {
        return ` ${name}: ${nonTypeCastedValue} ? ${typecastValue} : undefined,`;
      }
      return `    ${name}: ${typecastValue},`;
    }
  );

  // Convert the parent accessor  differently
  if (relationFieldsToParent && fieldType && modelTree.parent?.name) {
    relationFieldsToParent.forEach((s, index) => {
      let typecastValue = `params.${parentSlugs[index]}`;
      if (fieldType === "Int" || fieldType === "Float") {
        typecastValue = `Number(${typecastValue})`;
      } else if (fieldType === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      } else if (fieldType === "DateTime") {
        typecastValue = `new Date(String(${typecastValue}))`;
      } else {
        typecastValue = `String(${typecastValue})`;
      }
      convertToPrismaInputLines.push(`    ${s}: ${typecastValue},`);
    });
  }

  // Convert fields pointing to other relations differently
  modelTree.model.fields.map((field) => {
    if (field.kind === "object") {
      const relationFrom = field.relationFromFields && field.relationFromFields;
      const referencedModelName = field.type;

      if (referencedModelName === modelTree.parent?.name) {
      } else if (relationFrom) {
        relationFrom.forEach((rf) => {
          const fieldType2 = modelTree.model.fields.find(
            (f) => f.name === rf
          )?.type;

          let typecastValue = `formData.get('${relationFrom}')`;
          if (fieldType2 === "Int" || fieldType2 === "Float") {
            typecastValue = `Number(${typecastValue})`;
          } else if (fieldType2 === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
          } else if (fieldType2 === "DateTime") {
            typecastValue = `new Date(String(${typecastValue}))`;
          } else {
            typecastValue = `String(${typecastValue})`;
          }

          convertToPrismaInputLines.push(
            `    ${relationFrom}: ${typecastValue},`
          );
        });
      }
    }
  });
  convertToPrismaInputLines.push(manyToManyConnect);
  return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}

export function generateConvertToPrismaInputCode(modelTree: ModelTree): string {
  const fieldsToConvert: Partial<DMMF.Field>[] = modelTree.model.fields
    .filter(({ isId }) => !isId)
    .filter((field) => isFieldRenderable(field));

  const convertToPrismaInputLines = fieldsToConvert.map(
    ({ name, type, kind }) => {
      let typecastValue = `formData.get('${name}')`;
      if (kind === "enum") {
        typecastValue += ` as ${type}`;
      } else {
        if (type === "Int" || type === "Float") {
          typecastValue = `Number(${typecastValue})`;
        } else if (type === "Boolean") {
          typecastValue = `Boolean(${typecastValue})`;
        } else if (type === "DateTime") {
          typecastValue = `new Date(String(${typecastValue}))`;
        } else {
          typecastValue = `String(${typecastValue})`;
        }
      }
      return `    ${name}: ${typecastValue},`;
    }
  );

  // Convert fields pointing to other relations differently
  modelTree.model.fields.map((field) => {
    if (field.kind === "object") {
      const relationFrom = field.relationFromFields && field.relationFromFields;
      const referencedModelName = field.type;

      if (referencedModelName === modelTree.parent?.name) {
      } else if (relationFrom) {
        relationFrom.forEach((rf) => {
          const fieldType2 = modelTree.model.fields.find(
            (f) => f.name === rf
          )?.type;

          let typecastValue = `formData.get('${relationFrom}')`;
          if (fieldType2 === "Int" || fieldType2 === "Float") {
            typecastValue = `Number(${typecastValue})`;
          } else if (fieldType2 === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
          } else if (fieldType2 === "DateTime") {
            typecastValue = `new Date(String(${typecastValue}))`;
          } else {
            typecastValue = `String(${typecastValue})`;
          }

          convertToPrismaInputLines.push(
            `    ${relationFrom}: ${typecastValue},`
          );
        });
      }
    }
  });

  return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}

export function generateWhereParentClause(
  inputObject: string | undefined,
  fieldAccessValue: string | undefined,
  parentIdentifierFieldName: string | undefined,
  parentIdentifierFieldType: string | undefined,
  parentReferenceField: string | undefined,
  manyToManyWhere: string
): string {
  // console.log({
  //   fieldAccessValue,
  //   parentIdentifierFieldName,
  //   parentIdentifierFieldType,
  //   parentReferenceField,
  // });
  if (manyToManyWhere == "") {
    if (
      inputObject &&
      fieldAccessValue &&
      parentIdentifierFieldName &&
      parentIdentifierFieldType &&
      parentReferenceField
    ) {
      let typecastValue = `${inputObject}.${fieldAccessValue}`;
      if (
        parentIdentifierFieldType === "Int" ||
        parentIdentifierFieldType === "Float"
      ) {
        typecastValue = `Number(${typecastValue})`;
      } else if (parentIdentifierFieldType === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      } else if (parentIdentifierFieldType === "String") {
        typecastValue = `String(${typecastValue})`;
      }
      return `({ where: { ${parentReferenceField}: {${parentIdentifierFieldName}: {equals: ${typecastValue}} } } })`;
    } else {
      return "";
    }
  } else {
    return `({ ${manyToManyWhere} })`;
  }
}

export function generateWhereClause(
  inputObject: string | undefined,
  uniqueDynamicSlugs: string[],
  modelUniqueIdFields: {
    name: string;
    type: string;
  }[]
): string {
  let returnClause = "";
  if (inputObject && modelUniqueIdFields) {
    if (modelUniqueIdFields.length > 1) {
      returnClause +=
        "{" + modelUniqueIdFields.map((f) => f.name).join("_") + ":{";
      modelUniqueIdFields.forEach((f, index) => {
        let typecastValue = `${inputObject}.${uniqueDynamicSlugs[index]}`;
        if (f.type === "Int" || f.type === "Float") {
          typecastValue = `Number(${typecastValue})`;
        } else if (f.type === "Boolean") {
          typecastValue = `Boolean(${typecastValue})`;
        } else if (f.type === "String") {
          typecastValue = `String(${typecastValue})`;
        }

        returnClause += `${f.name}: ${typecastValue} ,`;
      });
      returnClause += "}},";
    } else {
      const { name, type } = modelUniqueIdFields[0];
      let typecastValue = `${inputObject}.${uniqueDynamicSlugs[0]}`;
      if (type === "Int" || type === "Float") {
        typecastValue = `Number(${typecastValue})`;
      } else if (type === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      } else if (type === "String") {
        typecastValue = `String(${typecastValue})`;
      }

      return `{ ${name}: ${typecastValue} },`;
    }
    return returnClause;
  } else {
    return "";
  }
}

export function generateDeleteClause(
  uniqueIdentifierFields: {
    name: string;
    type: string;
  }[]
): string {
  if (uniqueIdentifierFields.length === 1) {
    const singleIdField = uniqueIdentifierFields[0];
    let typecastValue = `formData.get('${singleIdField.name}')`;
    if (singleIdField.type === "Int" || singleIdField.type === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (singleIdField.type === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    } else if (singleIdField.type === "String") {
      typecastValue = `String(${typecastValue})`;
    }
    return `{ ${singleIdField.name}: ${typecastValue} },`;
  } else if (uniqueIdentifierFields.length >= 2) {
    let andClause = "{" + uniqueIdentifierFields.map((f) => f.name).join("_");
    andClause += ":{";
    uniqueIdentifierFields.forEach((f) => {
      let typecastValue = `formData.get('${f.name}')`;
      if (f.type === "Int" || f.type === "Float") {
        typecastValue = `Number(${typecastValue})`;
      } else if (f.type === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      } else if (f.type === "String") {
        typecastValue = `String(${typecastValue})`;
      }
      andClause += `${f.name}: ${typecastValue},`;
    });
    andClause += "}}";
    return andClause;
  }
  return "";
}

// Custom export function to check if field is renderable in a form
export function isFieldRenderable(field: DMMF.Field): boolean {
  return !(field.isReadOnly || field.isList || !!field.relationName);
}
export function generateFormFields(
  modelTree: ModelTree,
  enums: Record<string, string[]>
): string {
  return modelTree.model.fields
    .map((field) => {
      const required =
        field.isRequired && !field.hasDefaultValue ? "required" : "";

      const widthStyle = field.type === "Boolean" ? "" : "w-full";
      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label className="block text-slate-500 dark:text-slate-400">${
          field.name
        } ${required && "*"} </label>\n

        <select name="${
          field.name
        }" className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400" id="${
          field.name
        }">
        ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
</select>`;
      }

      const inputType = prismaFieldToInputType[field.type] || "text";

      if (field.kind === "object") {
        const relationFrom =
          field.relationFromFields && field.relationFromFields[0];

        const referencedModelName = field.type;

        if (referencedModelName === modelTree.parent?.name) {
        } else if (relationFrom) {
          const fieldType2 = modelTree.model.fields.find(
            (f) => f.name === relationFrom
          )?.type;
          if (fieldType2) {
            const inputType2 = prismaFieldToInputType[fieldType2] || "text";

            return `<label className="block text-slate-500 dark:text-slate-400">${relationFrom} ${
              required && "*"
            }</label>\n
            <input type="${inputType2}" name="${relationFrom}"      
            className="block border border-slate-300 px-2 py-1 dark:border-slate-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 ${widthStyle}"
            ${required}/>`;
          } else {
            return "";
          }
        }
      }

      let returnValue = "";
      if (isFieldRenderable(field)) {
        returnValue = `<label className="block text-slate-500 dark:text-slate-400">${
          field.name
        } ${required && "*"}</label>\n
        <input type="${inputType}" name="${field.name}"    
        className="block border border-slate-300 dark:border-slate-600 px-2 py-1 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 ${widthStyle}" ${required}/>`;
      }

      return returnValue;
    })
    .join("\n");
}

export function generateFormFieldsWithDefaults(
  tableFields: DMMF.Field[],
  enums: Record<string, string[]>
): string {
  return tableFields
    .map((field) => {
      if (!isFieldRenderable(field)) {
        return "";
      }
      const required =
        field.isRequired && !field.hasDefaultValue ? "required" : "";
      const widthStyle = field.type === "Boolean" ? "" : "w-full";

      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label className="block text-slate-500 dark:text-slate-400">${
          field.name
        } </label>\n
              <select className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400" name="${
                field.name
              } ${required && "*"}" id="${
          field.name
        }" defaultValue={nexquikTemplateModel?.${field.name}}>
              ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
      </select>`;
      }
      const inputType = prismaFieldToInputType[field.type] || "text";
      const defaultValue = field.isId
        ? `{nexquikTemplateModel?.${field.name} || 'N/A'}`
        : field.type === "Number"
        ? `{Number(nexquikTemplateModel?.${field.name})}`
        : field.type === "DateTime"
        ? `{nexquikTemplateModel?.${field.name}.toISOString().slice(0, 16)}`
        : `{String(nexquikTemplateModel?.${field.name})}`;
      const disabled = field.isId ? "disabled" : "";

      return `<label className="block text-slate-500 dark:text-slate-400">${
        field.name
      } ${required && "*"}</label>\n<input    
       className="block border border-slate-300 px-2 py-1 dark:border-slate-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 ${widthStyle}" type="${inputType}" name="${
        field.name
      }" defaultValue=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}
