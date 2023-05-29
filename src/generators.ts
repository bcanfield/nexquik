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
  getDynamicSlug,
  popStringEnd,
} from "./helpers";
import {
  createModelTree,
  getCompositeKeyFields,
  getParentReferenceField,
  ModelTree,
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
  const slug =
    modelTree.uniqueIdentifierField?.name &&
    getDynamicSlug(modelTree.model.name, modelTree.uniqueIdentifierField.name);
  const childrenLinks = modelTree.children
    .map(
      (
        c
      ) => `<Link className="base-link view-link" href={\`${routeUrl}/\${params.${slug}}/${
        c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)
      }\`}>
    ${c.modelName} List
</Link>`
    )
    .join("\n");
  return childrenLinks;
}
``;
async function generateListForm(
  modelTree: ModelTree,
  routeUrl: string
): Promise<string> {
  const uniqueField = modelTree.model.fields.find(
    (tableField) => tableField.isId
  );
  const uniqueFieldInputType =
    (uniqueField?.type && prismaFieldToInputType[uniqueField.type]) || "text";
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
      <input hidden type="${uniqueFieldInputType}" name="${
    uniqueField?.name
  }" defaultValue={nexquikTemplateModel?.${uniqueField?.name}} />
  <div className="action-buttons">
          <Link href={\`${routeUrl}/\${nexquikTemplateModel.${
    uniqueField?.name
  }}\`} className="action-link view-link">View</Link>
                  <Link href={\`${routeUrl}/\${nexquikTemplateModel.${
    uniqueField?.name
  }}/edit\`} className="action-link edit-link">Edit</Link>
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
  outputDirectory: string
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
  const enums = getEnums(dmmf.datamodel);
  console.log(chalk.blue("Generating App Directory"));
  const routes = await generateAppDirectoryFromModelTree(
    modelTree,
    outputDirectory,
    enums
  );
  // prettyPrintAPIRoutes(routes);
  console.log(chalk.blue("Generating Route List"));
  const routeList = generateRouteList(routes);

  // Copy over the files in the root dir
  addStringBetweenComments(
    path.join(__dirname, "templateApp"),
    routeList,
    "{/* @nexquik routeList start */}",
    "{/* @nexquik routeList stop */}"
  );
  console.log(chalk.blue("Finishing Up"));
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
  routeUrl: string
): Promise<string> {
  const uniqueField = modelTree.model.fields.find(
    (tableField) => tableField.isId
  );
  const uniqueFieldInputType =
    (uniqueField?.type && prismaFieldToInputType[uniqueField.type]) || "text";

  // Define the React component template as a string
  const reactComponentTemplate = `
    <form>
    <input hidden type="${uniqueFieldInputType}" name="${
    uniqueField?.name
  }" defaultValue={nexquikTemplateModel?.${uniqueField?.name}} />
    <div className="button-group">


    <Link className="action-link edit-link" href={\`${routeUrl}/\${nexquikTemplateModel.${
    uniqueField?.name
  }}/edit\`}>Edit</Link>

  
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
      <span className="value">{\`\${nexquikTemplateModel.${field.name}}\`}</span>
  </div>`;
      })
      .join("\n")}
    </div>

    </form>
  `;

  return reactComponentTemplate;
}

function generateRouteList(routes: RouteObject[]) {
  const routeLinks = [];
  for (const route of routes) {
    routeLinks.push(
      `<tr className="item-row">
      <td>${route.segment}</td>
      <td>${route.operation} ${route.model}</td>
      <td>${route.description}</td>
      </tr>`
    );
  }
  return `<table className="item-list">  <tbody><tr className="header-row">

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
    parentRoute: { name: string; uniqueIdentifierField?: string }
  ) {
    const modelName = modelTree.modelName;
    const modelUniqueIdentifierField = modelTree.uniqueIdentifierField;
    const route =
      parentRoute.name +
      (parentRoute.name === "/"
        ? ""
        : `/[${getDynamicSlug(
            modelTree.parent?.name,
            parentRoute.uniqueIdentifierField
          )}]/`) +
      modelName.charAt(0).toLowerCase() +
      modelName.slice(1);

    const directoryToCreate = path.join(outputDirectory, route);
    if (!fs.existsSync(directoryToCreate)) {
      fs.mkdirSync(directoryToCreate);
    }

    const uniqueDynamicSlug = getDynamicSlug(
      modelTree.modelName,
      modelUniqueIdentifierField?.name
    );

    copyDirectory(
      path.join(__dirname, "templateApp", "nexquikTemplateModel"),
      directoryToCreate,
      true
    );

    let modelUniqueIdentifier: { fieldName: string; fieldType: string }[] = [];
    const identifierField = modelTree.model.fields.find((field) => field.isId);
    // Bypass the creation of dynamic routes for this model if we cannot find a unique id field
    // TODO: Figure out how to support composite types in dynamic routes
    if (!identifierField) {
      console.log(
        `Cannot find identifier field for model: ${modelTree.model.name}`
      );
      const compositeKeyFields = getCompositeKeyFields(modelTree);
      if (compositeKeyFields && compositeKeyFields.length >= 2) {
        modelUniqueIdentifier = compositeKeyFields;
        `Found a composite key. Nexquik does not yet support this. So we will bypass some of the generation on this model`;
      } else {
        console.log(
          `Could not find identifier field OR composite type for model: ${modelTree.model.name}`
        );
      }
      // Just remove the dynamic directory for now
      fs.rmSync(path.join(directoryToCreate, "[id]"), { recursive: true });
    } else {
      modelUniqueIdentifier.push({
        fieldName: identifierField.name,
        fieldType: identifierField.type,
      });
      fs.renameSync(
        path.join(directoryToCreate, "[id]"),
        path.join(directoryToCreate, `[${uniqueDynamicSlug}]`)
      );
    }

    // ############### List Page
    const listFormCode = await generateListForm(
      modelTree,
      convertRouteToRedirectUrl(route)
    );
    addStringBetweenComments(
      directoryToCreate,
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
    let parentIdentifierField = "";

    if (parentIdentifierFields && parentIdentifierFields.length > 0) {
      parentIdentifierField = parentIdentifierFields[0];
    }
    // ##############

    const deleteWhereClause = generateDeleteClause(
      modelTree.uniqueIdentifierField?.name || parentIdentifierField,
      modelTree.uniqueIdentifierField?.type || fieldType
    );
    addStringBetweenComments(
      directoryToCreate,
      deleteWhereClause,
      "//@nexquik prismaDeleteClause start",
      "//@nexquik prismaDeleteClause stop"
    );
    const listRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      listRedirect,
      "//@nexquik listRedirect start",
      "//@nexquik listRedirect stop"
    );
    const whereparentClause = modelTree.parent
      ? generateWhereParentClause(
          "params",
          getDynamicSlug(modelTree.parent.name, parentIdentifierField),
          modelTree.model.fields.find((field) => field.isId)?.name ||
            parentIdentifierField,
          modelTree.model.fields.find((field) => field.isId)?.type || fieldType,
          getParentReferenceField(modelTree)
        )
      : "()";
    addStringBetweenComments(
      directoryToCreate,
      whereparentClause,
      "//@nexquik prismaWhereParentClause start",
      "//@nexquik prismaWhereParentClause stop"
    );

    // ############### Show Page
    const showFormCode = await generateShowForm(
      modelTree,
      convertRouteToRedirectUrl(route)
    );
    addStringBetweenComments(
      directoryToCreate,
      showFormCode,
      "{/* @nexquik showForm start */}",
      "{/* @nexquik showForm stop */}"
    );
    const childModelLinkList = await generateChildrenList(
      modelTree,
      convertRouteToRedirectUrl(route)
    );
    addStringBetweenComments(
      directoryToCreate,
      childModelLinkList,
      "{/* @nexquik listChildren start */}",
      "{/* @nexquik listChildren stop */}"
    );

    // ############### Create Page
    const createFormCode = await generateCreateForm(
      modelTree,
      convertRouteToRedirectUrl(route),
      enums
    );
    addStringBetweenComments(
      directoryToCreate,
      createFormCode,
      "{/* @nexquik createForm start */}",
      "{/* @nexquik createForm stop */}"
    );
    const createRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}/\${created.${
        modelTree.uniqueIdentifierField?.name
      }}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      createRedirect,
      "//@nexquik createRedirect start",
      "//@nexquik createRedirect stop"
    );
    const createLink = await generateLink(
      `${convertRouteToRedirectUrl(route)}/create`,
      "Create New NexquikTemplateModel"
    );
    addStringBetweenComments(
      directoryToCreate,
      createLink,
      "{/* @nexquik createLink start */}",
      "{/* @nexquik createLink stop */}"
    );
    const prismaInput = generateConvertToPrismaInputCode(modelTree);
    addStringBetweenComments(
      directoryToCreate,
      prismaInput,
      "//@nexquik prismaDataInput start",
      "//@nexquik prismaDataInput stop"
    );
    const whereClause = generateWhereClause(
      "params",
      uniqueDynamicSlug,
      identifierField?.type,
      identifierField?.name
    );
    addStringBetweenComments(
      directoryToCreate,
      whereClause,
      "//@nexquik prismaWhereInput start",
      "//@nexquik prismaWhereInput stop"
    );

    // ############### Edit Page
    const editFormCode = await generateEditForm(
      modelTree,
      convertRouteToRedirectUrl(route),
      enums
    );
    addStringBetweenComments(
      directoryToCreate,
      editFormCode,
      "{/* @nexquik editForm start */}",
      "{/* @nexquik editForm stop */}"
    );

    const editRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}/\${params.${uniqueDynamicSlug}}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      editRedirect,
      "//@nexquik editRedirect start",
      "//@nexquik editRedirect stop"
    );

    // ############### Extras
    const revalidatePath = await generateRevalidatePath(
      `${convertRouteToRedirectUrl(route)}`
    );
    addStringBetweenComments(
      directoryToCreate,
      revalidatePath,
      "//@nexquik revalidatePath start",
      "//@nexquik revalidatePath stop"
    );

    const backLink = await generateLink(
      popStringEnd(`${convertRouteToRedirectUrl(route)}`, "/"),
      "Back"
    );
    addStringBetweenComments(
      directoryToCreate,
      backLink,
      "{/* @nexquik backLink start */}",
      "{/* @nexquik backLink stop */}"
    );

    const backToCurrent = await generateLink(
      `${convertRouteToRedirectUrl(route)}`,
      "Back"
    );
    addStringBetweenComments(
      directoryToCreate,
      backToCurrent,
      "{/* @nexquik backToCurrentLink start */}",
      "{/* @nexquik backToCurrentLink stop */}"
    );

    // Replace all placeholder model names
    findAndReplaceInFiles(
      directoryToCreate,
      "nexquikTemplateModel",
      modelTree.modelName
    );

    // ############### Create Routes
    // Create
    routes.push({
      segment: `${route}/create`,
      model: modelName,
      operation: "Create",
      description: `Create a ${modelName}`,
    });

    // Edit
    routes.push({
      segment: `${route}/[${getDynamicSlug(
        modelName,
        modelTree.uniqueIdentifierField?.name
      )}]/edit`,
      model: modelName,
      operation: "Edit",
      description: `Edit a ${modelName} by ID`,
    });

    // Show
    routes.push({
      segment: `${route}/[${getDynamicSlug(
        modelName,
        modelTree.uniqueIdentifierField?.name
      )}]`,
      model: modelName,
      operation: "Show",
      description: `Get details of a ${modelName} by ID`,
    });

    // List
    routes.push({
      segment: route,
      model: modelName,
      operation: "List",
      description: `Get a list of ${modelName}s`,
    });

    for (const child of modelTree.children) {
      await generateRoutes(child, {
        name: route,
        uniqueIdentifierField: modelUniqueIdentifierField?.name,
      });
    }
  }

  for (const modelTree of modelTreeArray) {
    await generateRoutes(modelTree, {
      name: "/",
      uniqueIdentifierField: "",
    });
  }
  return routes;
}

export function generateConvertToPrismaInputCode(modelTree: ModelTree): string {
  // If model has a parent, get the parent accessor
  let relationFieldToParent = "";
  let fieldType = "";
  if (modelTree.parent) {
    // Get the field on the current model that is the id referencing the parent
    modelTree.model.fields.forEach((mf) => {
      if (mf.type === modelTree.parent?.name) {
        if (mf.relationFromFields?.length && mf.relationFromFields.length > 0) {
          relationFieldToParent = mf.relationFromFields[0];
        }
      }
    });

    // Get the field type on the current model that is the id referencing the parent
    fieldType =
      modelTree.model.fields.find((f) => f.name === relationFieldToParent)
        ?.type || "";
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
  if (relationFieldToParent && fieldType && modelTree.parent?.name) {
    let parentIdentifierField = "";
    const parentIdentifierFields = modelTree.model.fields.find((field) =>
      field.relationFromFields?.includes(relationFieldToParent)
    )?.relationToFields;
    if (parentIdentifierFields && parentIdentifierFields.length > 0) {
      parentIdentifierField = parentIdentifierFields[0];
    }
    const parentSlug = getDynamicSlug(
      modelTree.parent?.name,
      parentIdentifierField
    );
    let typecastValue = `params.${parentSlug}`;
    if (fieldType === "Int" || fieldType === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (fieldType === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    } else if (fieldType === "DateTime") {
      typecastValue = `new Date(String(${typecastValue}))`;
    } else {
      typecastValue = `String(${typecastValue})`;
    }
    convertToPrismaInputLines.push(
      `    ${relationFieldToParent}: ${typecastValue},`
    );
  }

  // Convert fields pointing to other relations differently
  modelTree.model.fields.map((field) => {
    if (field.kind === "object") {
      const relationFrom =
        field.relationFromFields && field.relationFromFields[0];

      const referencedModelName = field.type;

      if (referencedModelName === modelTree.parent?.name) {
      } else if (relationFrom) {
        const fieldType2 = modelTree.model.fields.find(
          (f) => f.name === relationFrom
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
  parentReferenceField: string | undefined
): string {
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
}

export function generateWhereClause(
  inputObject: string | undefined,
  identifierFieldName: string | undefined,
  identifierFieldType: string | undefined,
  modelUniqueIdField: string | undefined
): string {
  if (
    inputObject &&
    identifierFieldName &&
    identifierFieldType &&
    modelUniqueIdField
  ) {
    let typecastValue = `${inputObject}.${identifierFieldName}`;
    if (identifierFieldType === "Int" || identifierFieldType === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (identifierFieldType === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    }

    return `{ ${modelUniqueIdField}: ${typecastValue} },`;
  } else {
    return "";
  }
}

export function generateDeleteClause(
  identifierFieldName: string | undefined,
  identifierFieldType: string | undefined
): string {
  if (identifierFieldName && identifierFieldType) {
    let typecastValue = `formData.get('${identifierFieldName}')`;
    if (identifierFieldType === "Int" || identifierFieldType === "Float") {
      typecastValue = `Number(${typecastValue})`;
    } else if (identifierFieldType === "Boolean") {
      typecastValue = `Boolean(${typecastValue})`;
    }

    return `{ ${identifierFieldName}: ${typecastValue} },`;
  } else {
    return "";
  }
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

      if (!isFieldRenderable(field) || field.isId) {
        return "";
      }
      return `<label>${field.name}</label>\n
        <input type="${inputType}" name="${field.name}" ${required}/>`;
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
        }" defaultValue={nexquikTemplateModel.${field.name}}>
              ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
      </select>`;
      }
      const inputType = prismaFieldToInputType[field.type] || "text";
      const defaultValue = field.isId
        ? `{nexquikTemplateModel.${field.name} || 'N/A'}`
        : field.type === "DateTime"
        ? `{nexquikTemplateModel.${field.name}.toISOString().slice(0, 16)}`
        : `{nexquikTemplateModel.${field.name}}`;
      const disabled = field.isId ? "disabled" : "";
      const required = field.isRequired ? "required" : "";

      return `<label>${field.name}</label>\n<input type="${inputType}" name="${field.name}" defaultValue=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}
