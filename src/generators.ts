import { DMMF } from "@prisma/generator-helper";
import { getDMMF } from "@prisma/internals";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import {
  convertRouteToRedirectUrl,
  copyDirectory,
  copyFileToDirectory,
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
      <form action={addNexquikTemplateModel}>
        ${formFields}
        <div className="button-group">
        <button type="submit" className="create-button">
            Create NexquikTemplateModel
        </button>
        <Link href={\`${routeUrl}\`} className="cancel-link">
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
  <Link href={${linkString}} className="base-link">
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
    <form action={editNexquikTemplateModel}>
        ${formFields}
        <div className="button-group">
        <button className="create-button" type="submit">Update NexquikTemplateModel</button>
        <Link href={\`${routeUrl}\`} className="cancel-link">
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
    let childLink = `<Link className="base-link view-link" href={\`${routeUrl}/`;
    slug.forEach((s) => {
      childLink += `\${params.${s}}/`;
    });

    childLink += `${
      c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)
    }\`}>
  ${c.modelName} List
</Link>`;
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
  <table className="item-list">
  <tbody>
  <tr className="header-row">
  ${modelTree.model.fields
    .map((field) => {
      if (isFieldRenderable(field)) {
        return `<th> ${field.name} </th>`;
      }
    })
    .join("\n")}
  </tr>

    {nexquikTemplateModel?.map((nexquikTemplateModel, index) => (
      <tr key={index} className="item-row">
      
      ${modelTree.model.fields
        .map((field) => {
          if (isFieldRenderable(field)) {
            return `<td> {\`\${nexquikTemplateModel.${field.name}}\`} </td>`;
          }
        })
        .join("\n")}

      <td className="action-cell">
      <form>
      ${uniqueFormInputs}
  <div className="action-buttons">
          <Link href={\`${linkHref}\`} className="action-link view-link">View</Link>
                  <Link href={\`${linkHref}/edit\`} className="action-link edit-link">Edit</Link>
                  <button formAction={deleteNexquikTemplateModel} className="action-link delete-link">Delete</button>
                  </div>
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
  outputDirectory: string,
  prismaImport: string
) {
  // Read the Prisma schema file
  console.log(chalk.blue("Locating Prisma Schema File"));
  const prismaSchema = await readFileAsync(prismaSchemaPath, "utf-8");

  // Create the output Directory
  console.log(chalk.blue("Creating output directory"));
  if (fs.existsSync(outputDirectory)) {
    // Directory already exists, delete it
    fs.rmSync(outputDirectory, { recursive: true });
  }

  // Create the directory
  fs.mkdirSync(outputDirectory);

  // Main section to build the app from the modelTree
  console.log(chalk.blue("Reading Prisma Schema"));
  const dmmf = await getDMMF({ datamodel: prismaSchema });
  console.log(chalk.blue("Creating Tree"));
  const modelTree = createModelTree(dmmf.datamodel);
  if (modelTree.length === 0) {
    console.log(chalk.red("Nexquik Error: No valid models detected in schema"));
    throw new Error("Nexquik Error: No valid models detected in schema");
    return;
  }
  const enums = getEnums(dmmf.datamodel);
  console.log(chalk.blue("Generating App Directory"));
  // Replace prisma client import
  addStringBetweenComments(
    path.join(__dirname, "templateApp"),
    `import prisma from "${prismaImport}";`,
    "//@nexquik prismaClientImport start",
    "//@nexquik prismaClientImport stop"
  );
  console.log("TOP LEVEL MODEL TREE", { modelTree });
  const routes = await generateAppDirectoryFromModelTree(
    modelTree,
    outputDirectory,
    enums
  );
  // console.log({ routes });
  // prettyPrintAPIRoutes(routes);
  console.log(chalk.blue("Generating Route List"));
  const routeList = generateRouteList(routes);

  console.log(chalk.blue("Finishing Up"));
  // Copy over the files in the root dir
  addStringBetweenComments(
    path.join(__dirname, "templateApp"),
    routeList,
    "{/* @nexquik routeList start */}",
    "{/* @nexquik routeList stop */}"
  );
  const rootPageName = "page.tsx";
  copyFileToDirectory(
    path.join(__dirname, "templateApp", rootPageName),
    outputDirectory
  );

  const globalStylesFileName = "globals.css";
  copyFileToDirectory(
    path.join(__dirname, "templateApp", globalStylesFileName),
    outputDirectory
  );

  const rootLayoutFileName = "layout.tsx";
  copyFileToDirectory(
    path.join(__dirname, "templateApp", rootLayoutFileName),
    outputDirectory
  );
  return;
}

export async function generateShowForm(
  modelTree: ModelTree,
  routeUrl: string,
  enums: Record<string, string[]>
): Promise<string> {
  // const uniqueField = modelTree.model.fields.find(
  //   (tableField) => tableField.isId
  // );
  // const uniqueFieldInputType =
  //   (uniqueField?.type && prismaFieldToInputType[uniqueField.type]) || "text";
  const formFields = generateFormFieldsWithDefaults(
    modelTree.model.fields,
    enums
  );
  // console.log({ formFields });
  const uniqueFields = modelTree.uniqueIdentifierField;
  const nonUniqueFields = modelTree.model.fields.filter(
    (i) => !uniqueFields.find((j) => j.name === i.name)
  );
  // console.log(" show form unique", { uniqueFields, nonUniqueFields });
  // Define the React component template as a string

  let linkRoute = routeUrl;
  uniqueFields.forEach((f) => {
    linkRoute += `/\${nexquikTemplateModel?.${f?.name}}`;
  });
  const reactComponentTemplate = `
    <form>

    ${modelTree.model.fields
      .map((field) => {
        if (!isFieldRenderable(field)) {
          return "";
        }
        // if (field.kind === "enum") {
        //   const enumValues = enums[field.type];
        //   return `<label>${field.name}</label>\n
        //         <select name="${field.name}" id="${
        //     field.name
        //   }" defaultValue={nexquikTemplateModel?.${field.name}}>
        //         ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
        // </select>`;
        // }
        return `  <input hidden type="${field.type}" name="${field?.name}" defaultValue={nexquikTemplateModel?.${field?.name}} />`;
      })
      .join("\n")}


  
    <div className="button-group">


    <Link className="action-link edit-link" href={\`${linkRoute}/edit\`}>Edit</Link>

  
    <button className="action-link delete-link" formAction={deleteNexquikTemplateModel}>Delete</button>
    </div>

    <div className="container view-item">

    ${modelTree.model.fields
      .map((field) => {
        if (!isFieldRenderable(field)) {
          return "";
        }
        return `<div className="pair">
      <span className="key">${field.name}</span>
      <span className="value">{\`\${nexquikTemplateModel?.${field.name}}\`}</span>
  </div>`;
      })
      .join("\n")}
    </div>

    </form>
  `;

  // const reactComponentTemplate = `
  //   <form>
  //       ${formFields}
  //       <div className="button-group">
  //       <button className="create-button" type="submit">Update NexquikTemplateModel</button>
  //       <Link href={\`${routeUrl}\`} className="cancel-link">
  //           Cancel
  //       </Link>
  //       </div>
  //     </form>
  // `;
  return reactComponentTemplate;

  return reactComponentTemplate;
}

function generateRouteList(routes: RouteObject[]) {
  const routeLinks = [];
  for (const route of routes) {
    console.log({ route });
    routeLinks.push(
      `<tr className="item-row">
      <td>${route.model}</td>
      <td>${
        route.segment.includes("[")
          ? route.segment
          : `<a href="${route.segment}">${route.segment}</a>`
      }</td>
      <td>${route.operation}</td>
      <td>${route.description}</td>
      </tr>`
    );
  }
  return `<table className="item-list">  <tbody><tr className="header-row">
  <th>Model</th>
  <th>Route</th>
  <th>Operation</th>
  <th>Description</th>
</tr>${routeLinks.join("\n")}           </tbody> </table>
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
    const modelName = modelTree.modelName;

    // Get the current mode'ls array of prisma unique id fields
    const modelUniqueIdentifierField = modelTree.uniqueIdentifierField;
    console.log(
      `MODEL NAME: ${modelName}\n Unique id field: ${modelUniqueIdentifierField.map(
        (f) => f.name
      )}\n\n #####CHILDREN: ${modelTree.children.map((c) => c.modelName)}`
    );

    // Get the unique slugs of the parent model (combines modelname and id field to ensure uniqueness (i.e. bookingid1))
    // const parentUniqueSlugs = getDynamicSlugs(
    //   modelTree.parent?.name,
    //   parentRoute.uniqueIdentifierField.map((f) => f.name)
    // );
    let route = parentRoute.name;
    console.log({ route });

    // if (parentRoute.name !== "/") {
    //   parentUniqueSlugs.forEach((parentSlug) => {
    //     route += `/[${parentSlug}]/`;
    //   });
    // }
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
    console.log({ slugss, splitRoute });

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
    console.log("()()()()()()", { createRedirectForm });

    // Create base directory for model
    const baseModelDirectory = path.join(outputDirectory, route);
    const baseParts = baseModelDirectory
      .split(path.sep)
      .filter((item) => item !== "");
    console.log({ baseParts });
    let currentBasePath = "";
    for (const part of baseParts) {
      currentBasePath = path.join(currentBasePath, part);
      console.log("CREATING", currentBasePath);
      if (!fs.existsSync(currentBasePath)) {
        fs.mkdirSync(currentBasePath);
      }
    }
    console.log({ baseModelDirectory });

    if (baseModelDirectory !== "app/") {
      // Copy base directory files from template
      copyDirectory(
        path.join(__dirname, "templateApp", "nexquikTemplateModel"),
        baseModelDirectory,
        true,
        "[id]"
      );
    } else {
      console.log("ERROR, not copying base model directory for ", modelName);
    }
    // Create dynamic directories

    const slugsForThisModel = getDynamicSlugs(
      modelTree.modelName,
      modelUniqueIdentifierField.map((f) => f.name)
    );
    slugsForThisModel.forEach((parentSlug) => {
      route += `[${parentSlug}]/`;
    });
    console.log("Creating dynamic directory for model", {
      modelName,
      route,
    });
    // const parentSlugRoute = route;
    const dynamicOutputDirectory = path.join(outputDirectory, route);
    console.log("Creating base directory for model", {
      modelName,
      route,
    });
    const parts = dynamicOutputDirectory
      .split(path.sep)
      .filter((item) => item !== "");
    console.log({ parts });
    let currentPath = "";
    for (const part of parts) {
      currentPath = path.join(currentPath, part);
      console.log("CREATING", currentPath);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }

    // Copy template dynamic directory into new dynamic directory
    copyDirectory(
      path.join(__dirname, "templateApp", "nexquikTemplateModel", "[id]"),
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

    // ##############
    // TODO: Get this at the top level. If a model doesnt have a traditional id field we need to get it this way
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
    // console.log({
    //   currentFleidName: modelTree.model.name,
    //   parentFieldName: modelTree.parent?.name,
    //   fields: modelTree.model.fields,
    // });
    let parentIdentifierField = "";
    // console.log({ parentIdentifierFields });
    if (parentIdentifierFields && parentIdentifierFields.length > 0) {
      parentIdentifierField = parentIdentifierFields[0];
    }
    // console.log({ parentIdentifierField });
    // ##############

    const deleteWhereClause = generateDeleteClause(modelUniqueIdentifierField);
    // console.log({ deleteWhereClause });

    // const thisDynamicDirectory = path.join(outputDirectory, parentSlugRoute);
    // console.log("brandin adding delete clause in: ", thisDynamicDirectory);
    addStringBetweenComments(
      baseModelDirectory,
      deleteWhereClause,
      "//@nexquik prismaDeleteClause start",
      "//@nexquik prismaDeleteClause stop"
    );
    // console.log({ route });
    const listRedirect = await generateRedirect(`\`${createRedirectForm}\``);
    addStringBetweenComments(
      baseModelDirectory,
      listRedirect,
      "//@nexquik listRedirect start",
      "//@nexquik listRedirect stop"
    );
    // const parentObjects: {
    //   name: string;
    //   type: string;
    //   referenceField: string;
    // }[] = [];

    const parentIdFields = modelTree.model.fields.filter((field) => field.isId);
    // console.log({ parentIdFields });
    const parentObjects = parentIdentifierFields?.map((p) => ({
      name: p,
      type: modelTree.parent?.fields.find((f) => f.name === p)?.type || "",
      referenceField: modelTree.model.fields.find(
        (field) => field.type === modelTree.parent?.name
      ),
      slug: getDynamicSlugs(modelTree.modelName, [p])[0],
    }));
    // console.log({ parentObjects });

    // In parent, loop through fields and find field of 'type' current model
    let isManyToMany = false;
    let referenceFieldNameToParent = "";
    let parentIdField = modelTree.parent?.fields.find((f) => f.isId);
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
    console.log({
      name: modelTree.modelName,
      fields: modelTree.model.fields,
      parent: modelTree.parent,
      parentFields: modelTree.parent?.fields,
      manyToManyWhere,
    });
    // Does the current model have a many to many relation ship to its parent
    // Get the current model's parent
    // Find that field in the current model by type
    // if it is list, its a many to many
    // const aCurrentParent = modelTree.parent.
    const whereparentClause = modelTree.parent
      ? generateWhereParentClause(
          "params",
          getDynamicSlugs(modelTree.parent.name, [parentIdentifierField])[0],
          modelTree.model.fields.find((field) => field.isId)?.name ||
            parentIdentifierField,
          modelTree.model.fields.find((field) => field.isId)?.type || fieldType,
          getParentReferenceField(modelTree),
          manyToManyWhere
        )
      : "()";
    // const whereparentClause = modelTree.parent
    //   ? generateWhereParentClause(
    //       "params",
    //       getDynamicSlugs(modelTree.parent.name, [parentIdentifierField])[0],
    //       modelTree.model.fields.find((field) => field.isId)?.name ||
    //         parentIdentifierField,
    //       modelTree.model.fields.find((field) => field.isId)?.type || fieldType,
    //       getParentReferenceField(modelTree)
    //     )
    //   : "()";
    // console.log({ whereparentClause });
    addStringBetweenComments(
      baseModelDirectory,
      whereparentClause,
      "//@nexquik prismaWhereParentClause start",
      "//@nexquik prismaWhereParentClause stop"
    );

    // ############### Show Page
    const showFormCode = await generateShowForm(
      modelTree,
      createRedirectForm,
      enums
    );
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
    // console.log({ childModelLinkList });
    addStringBetweenComments(
      baseModelDirectory,
      childModelLinkList,
      "{/* @nexquik listChildren start */}",
      "{/* @nexquik listChildren stop */}"
    );
    // // ############### Create Page
    // console.log({ createRedirectForm, baseRoute });

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
    // console.log("NIKKI", { prismaInput });
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
    // console.log("NIKKI", { prismaCreateInput });
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
    // console.log({ whereClause, route });
    addStringBetweenComments(
      // thisDynamicDirectory,
      baseModelDirectory,
      whereClause,
      "//@nexquik prismaWhereInput start",
      "//@nexquik prismaWhereInput stop"
    );

    // // ############### Edit Page
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
    // console.log({ createRedirectForm, redirectStr2, editRedirect });
    addStringBetweenComments(
      baseModelDirectory,
      editRedirect,
      "//@nexquik editRedirect start",
      "//@nexquik editRedirect stop"
    );

    // // ############### Extras
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
      popStringEnd(`${createRedirectForm}`, "/"),
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

    // // Replace all placeholder model names
    findAndReplaceInFiles(
      baseModelDirectory,
      "nexquikTemplateModel",
      modelTree.modelName
    );

    // // ############### Create Routes
    // // Create

    // // Edit

    // let splitRoute = "";
    // const slugss = getDynamicSlugs(
    //   modelName,
    //   modelTree.uniqueIdentifierField.map((f) => f.name)
    // );
    // slugss.forEach((s) => {
    //   splitRoute += `[${s}]`;
    // });
    // console.log({ slugss, splitRoute });

    // routes.push({
    //   segment: `${route}${splitRoute}/edit`,
    //   model: modelName,
    //   operation: "Edit",
    //   description: `Edit a ${modelName} by ID`,
    // });

    // // Show
    // routes.push({
    //   segment: `${route}${splitRoute}`,
    //   model: modelName,
    //   operation: "Show",
    //   description: `Get details of a ${modelName} by ID`,
    // });

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
  return routes;
}

export function generateConvertToPrismaCreateInputCode(
  modelTree: ModelTree,
  parentSlugs: string[],
  manyToManyConnect: string
): string {
  const uniques = modelTree.model.fields;
  // console.log({ uniques });
  // If model has a parent, get the parent accessor
  let relationFieldsToParent: string[] = [];
  let fieldType = "";
  if (modelTree.parent) {
    // Get the field on the current model that is the id referencing the parent
    modelTree.model.fields.forEach((mf, index) => {
      if (mf.type === modelTree.parent?.name) {
        if (mf.relationFromFields?.length && mf.relationFromFields.length > 0) {
          relationFieldsToParent = mf.relationFromFields;
        }
      }
    });
    // console.log({ relationFieldsToParent });

    // Get the field type on the current model that is the id referencing the parent
    fieldType =
      modelTree.model.fields.find((f) =>
        relationFieldsToParent.find((a) => a === f.name)
      )?.type || "";
    // console.log({ fieldType });
  }

  const fieldsToConvert: Partial<DMMF.Field>[] = modelTree.model.fields
    .filter((field) => {
      if (field.name === "id") {
        const fieldRenderable = isFieldRenderable(field);
        // console.log("HERE IN NAME", {
        //   bool: field.isId !== true || field.hasDefaultValue == false,
        //   field,
        //   fieldRenderable,
        // });
      }
      return field.isId !== true || field.hasDefaultValue == false;
    })
    .filter((field) => isFieldRenderable(field));
  // console.log({ fieldsToConvert });

  const convertToPrismaInputLines = fieldsToConvert.map(({ name, type }) => {
    let typecastValue = `formData.get('${name}')`;
    if (type === "Int" || type === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (type === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    } else if (type === "DateTime") {
      typecastValue = `new Date(String(${typecastValue}))`;
    } else {
      typecastValue = `String(${typecastValue})`;
    }

    return `    ${name}: ${typecastValue},`;
  });

  // Convert the parent accessor  differently
  if (relationFieldsToParent && fieldType && modelTree.parent?.name) {
    // let parentIdentifierField = "";
    const parentIdentifierFields =
      modelTree.model.fields.find((field) =>
        field.relationFromFields?.includes(relationFieldsToParent[0])
      )?.relationToFields || [];
    // if (parentIdentifierFields && parentIdentifierFields.length > 0) {
    //   parentIdentifierField = parentIdentifierFields[0];
    // }
    // const parentSlugs = getDynamicSlugs(
    //   modelTree.parent?.name,
    //   parentIdentifierFields
    // );
    relationFieldsToParent.forEach((s, index) => {
      // console.log("in slugs", { relationFieldsToParent });
      // const relationTo =
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
  modelTree.model.fields.map((field, index) => {
    if (field.kind === "object") {
      const relationFrom = field.relationFromFields && field.relationFromFields;
      // console.log({ field }, { relationFrom });

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
  // console.log({ convertToPrismaInputLines });
  return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}

export function generateConvertToPrismaInputCode(
  modelTree: ModelTree,
  withParent: boolean = false
): string {
  // If model has a parent, get the parent accessor
  let relationFieldsToParent: string[] = [];
  let fieldType = "";
  if (modelTree.parent) {
    // Get the field on the current model that is the id referencing the parent
    modelTree.model.fields.forEach((mf, index) => {
      if (mf.type === modelTree.parent?.name) {
        if (mf.relationFromFields?.length && mf.relationFromFields.length > 0) {
          relationFieldsToParent = mf.relationFromFields;
        }
      }
    });
    // console.log({ relationFieldsToParent });

    // Get the field type on the current model that is the id referencing the parent
    fieldType =
      modelTree.model.fields.find((f) =>
        relationFieldsToParent.find((a) => a === f.name)
      )?.type || "";
    // console.log({ fieldType });
  }

  const fieldsToConvert: Partial<DMMF.Field>[] = modelTree.model.fields
    .filter(({ isId }) => !isId)
    .filter((field) => isFieldRenderable(field));

  const convertToPrismaInputLines = fieldsToConvert.map(({ name, type }) => {
    let typecastValue = `formData.get('${name}')`;
    if (type === "Int" || type === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (type === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    } else if (type === "DateTime") {
      typecastValue = `new Date(String(${typecastValue}))`;
    } else {
      typecastValue = `String(${typecastValue})`;
    }

    return `    ${name}: ${typecastValue},`;
  });

  // Convert the parent accessor  differently
  if (relationFieldsToParent && fieldType && modelTree.parent?.name) {
    // let parentIdentifierField = "";
    const parentIdentifierFields =
      modelTree.model.fields.find((field) =>
        field.relationFromFields?.includes(relationFieldsToParent[0])
      )?.relationToFields || [];
    // if (parentIdentifierFields && parentIdentifierFields.length > 0) {
    //   parentIdentifierField = parentIdentifierFields[0];
    // }
    // const parentSlugs = getDynamicSlugs(
    //   modelTree.parent?.name,
    //   parentIdentifierFields
    // );
    // parentSlugs.forEach((s, index) => {
    //   console.log("in slugs", { parentIdentifierFields });
    //   // const relationTo =
    //   let typecastValue = `params.${s}`;
    //   if (fieldType === "Int" || fieldType === "Float") {
    //     typecastValue = `Number(${typecastValue})`;
    //   } else if (fieldType === "Boolean") {
    //     typecastValue = `Boolean(${typecastValue})`;
    //   } else if (fieldType === "DateTime") {
    //     typecastValue = `new Date(String(${typecastValue}))`;
    //   } else {
    //     typecastValue = `String(${typecastValue})`;
    //   }
    //   convertToPrismaInputLines.push(
    //     `    ${parentIdentifierFields[index]}: ${typecastValue},`
    //   );
    // });
  }

  // Convert fields pointing to other relations differently
  modelTree.model.fields.map((field, index) => {
    if (field.kind === "object") {
      const relationFrom = field.relationFromFields && field.relationFromFields;
      // console.log({ field }, { relationFrom });

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

  // console.log({ convertToPrismaInputLines });
  return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}

export function generateWhereParentClause(
  // isManyToMany: boolean = false,
  inputObject: string | undefined,
  fieldAccessValue: string | undefined,
  parentIdentifierFieldName: string | undefined,
  parentIdentifierFieldType: string | undefined,
  parentReferenceField: string | undefined,
  manyToManyWhere: string
): string {
  // console.log({
  //   inputObject,
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
  // identifierFieldName: string | undefined,
  // identifierFieldType: string | undefined,
  modelUniqueIdFields: {
    name: string;
    type: string;
  }[]
): string {
  // console.log("WESLEY", { uniqueDynamicSlugs, modelUniqueIdFields });
  let returnClause = "";
  if (
    inputObject &&
    // identifierFieldName &&
    // identifierFieldType &&
    modelUniqueIdFields
  ) {
    // where id1: params.bookingid1
    if (modelUniqueIdFields.length > 1) {
      returnClause +=
        "{" + modelUniqueIdFields.map((f) => f.name).join("_") + ":{";
      modelUniqueIdFields.forEach((f, index) => {
        let typecastValue = `${inputObject}.${uniqueDynamicSlugs[index]}`;
        if (f.type === "Int" || f.type === "Float") {
          typecastValue = `Number(${typecastValue})`;
        } else if (f.type === "Boolean") {
          typecastValue = `Boolean(${typecastValue})`;
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
  // console.log("deleteClause", { uniqueIdentifierFields });
  if (uniqueIdentifierFields.length === 1) {
    const singleIdField = uniqueIdentifierFields[0];
    let typecastValue = `formData.get('${singleIdField.name}')`;
    if (singleIdField.type === "Int" || singleIdField.type === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (singleIdField.type === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    }
    return `{ ${singleIdField.name}: ${typecastValue} },`;
  } else if (uniqueIdentifierFields.length >= 2) {
    // let andClause = "{ AND: [";
    // uniqueIdentifierFields.forEach((f) => {
    //   let typecastValue = `formData.get('${f.name}')`;
    //   if (f.type === "Int" || f.type === "Float") {
    //     typecastValue = `Number(${typecastValue})`;
    //   } else if (f.type === "Boolean") {
    //     typecastValue = `Boolean(${typecastValue})`;
    //   }
    //   andClause += `{ ${f.name}: ${typecastValue} },`;
    // });
    // andClause += "]}";
    // return andClause;

    let andClause = "{" + uniqueIdentifierFields.map((f) => f.name).join("_");
    andClause += ":{";
    uniqueIdentifierFields.forEach((f) => {
      let typecastValue = `formData.get('${f.name}')`;
      if (f.type === "Int" || f.type === "Float") {
        typecastValue = `Number(${typecastValue})`;
      } else if (f.type === "Boolean") {
        typecastValue = `Boolean(${typecastValue})`;
      }
      andClause += `${f.name}: ${typecastValue},`;
    });
    andClause += "}}";
    // console.log({ andClause });
    return andClause;
    // const prismaIdentifier = `${f.name}`
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
      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label>${field.name}</label>\n

        <select name="${field.name}" id="${field.name}">
        ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
</select>`;
      }

      const inputType = prismaFieldToInputType[field.type] || "text";
      const required = field.isRequired ? "required" : "";

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

            return `<label>${relationFrom}</label>\n
            <input type="${inputType2}" name="${relationFrom}" ${required}/>`;
          } else {
            return "";
          }
        }
      }

      let returnValue = "";
      if (field.name === "id") {
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$\n", {
        //   field,
        //   isRender: isFieldRenderable(field),
        //   bool: field.isId == false || field.hasDefaultValue === false,
        //   full:
        //     isFieldRenderable(field) &&
        //     (field.isId == false || field.hasDefaultValue === false),
        // });
      }

      if (
        isFieldRenderable(field) &&
        (field.isId == false || field.hasDefaultValue === false)
      ) {
        returnValue = `<label>${field.name}</label>\n
        <input type="${inputType}" name="${field.name}" ${required}/>`;
      }
      // console.log({ returnValue });

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
      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label>${field.name}</label>\n
              <select name="${field.name}" id="${
          field.name
        }" defaultValue={nexquikTemplateModel?.${field.name}}>
              ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
      </select>`;
      }
      const inputType = prismaFieldToInputType[field.type] || "text";
      const defaultValue = field.isId
        ? `{nexquikTemplateModel?.${field.name} || 'N/A'}`
        : field.type === "DateTime"
        ? `{nexquikTemplateModel?.${field.name}.toISOString().slice(0, 16)}`
        : `{nexquikTemplateModel?.${field.name}}`;
      const disabled = field.isId ? "disabled" : "";
      const required = field.isRequired ? "required" : "";

      return `<label>${field.name}</label>\n<input type="${inputType}" name="${field.name}" defaultValue=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}
