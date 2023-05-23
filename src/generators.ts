#! /usr/bin/env node
import { DMMF } from "@prisma/generator-helper";
import { getDMMF } from "@prisma/internals";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import { copyFileToDirectory, findAndReplaceInFiles } from "./fileHelpers";
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

export interface ModelTree {
  modelName: string;
  parent?: DMMF.Model;
  model: DMMF.Model;
  children: ModelTree[];
  // uniqueIdentifierField?: string;
  uniqueIdentifierField?: DMMF.Field;
}

// Part 2 Begin
function copyDirectory(
  sourceDir: string,
  destinationDir: string,
  toReplace: boolean = false
): void {
  if (toReplace && fs.existsSync(destinationDir)) {
    fs.rmSync(destinationDir, { recursive: true });
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  // Read the contents of the source directory
  const files = fs.readdirSync(sourceDir);

  files.forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destinationFile = path.join(destinationDir, file);

    // Check if the file is a directory
    if (fs.statSync(sourceFile).isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourceFile, destinationFile, toReplace);
    } else {
      // Copy file if it doesn't exist in the destination directory
      if (!fs.existsSync(destinationFile)) {
        fs.copyFileSync(sourceFile, destinationFile);
      }
    }
  });
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
} // Part 2 End

async function generateCreateForm(modelTree: ModelTree): Promise<string> {
  // const tableFields = await extractTableFields(tableName, prismaSchema);
  // console.log({ tableFields });
  const formFields = generateFormFields(modelTree.model.fields);
  // console.log({ formFields });
  // Define the React component template as a string
  const reactComponentTemplate = `
      <form action={addNexquikTemplateModel}>
        ${formFields}
        <button type="submit">Create NexquikTemplateModel</button>
      </form>
  `;

  return reactComponentTemplate;
}

async function generateRedirect(
  identifierField: string,
  dataObjectName: string
): Promise<string> {
  const reactComponentTemplate = `
    redirect(\`/nexquikTemplateModel/\${${dataObjectName}.${identifierField}}\`);
  `;
  return reactComponentTemplate;
}

async function generateEditForm(modelTree: ModelTree): Promise<string> {
  // const tableFields = await extractTableFields(tableName, prismaSchema);
  const formFields = generateFormFieldsWithDefaults(modelTree.model.fields);
  // Define the React component template as a string
  const reactComponentTemplate = `
    <form action={editNexquikTemplateModel}>
        ${formFields}
        <button type="submit">Update NexquikTemplateModel</button>
      </form>
  `;

  return reactComponentTemplate;
}
``;
async function generateListForm2(modelTree: ModelTree): Promise<string> {
  const uniqueField = modelTree.model.fields.find(
    (tableField) => tableField.isId
  );
  const uniqueFieldInputType =
    prismaFieldToInputType[uniqueField.type] || "text";
  // Define the React component template as a string
  const reactComponentTemplate = `
    <ul>
    {nexquikTemplateModel?.map((nexquikTemplateModel, index) => (
      <li key={index}>
        <form>
        <input hidden type="${uniqueFieldInputType}" name="${
    uniqueField.name
  }" defaultValue={nexquikTemplateModel?.${
    uniqueField.name
  }} />        ${modelTree.model.fields.map((field) => {
    if (!isFieldRenderable(field)) {
      return "";
    }
    return `<p> ${field.name} {\`\${nexquikTemplateModel.${field.name}}\`} </p>`;
  })}
          <Link href={\`/nexquikTemplateModel/\${nexquikTemplateModel.${
            uniqueField.name
          }}\`}>View</Link>
          <Link href={\`/nexquikTemplateModel/\${nexquikTemplateModel.${
            uniqueField.name
          }}/edit\`}>Edit</Link>
          <button formAction={deleteNexquikTemplateModel}>Delete</button>
        </form>
      </li>
    ))}
  </ul>
  `;

  return reactComponentTemplate;
}

export async function generateReactForms(
  prismaSchemaPath: string,
  outputDirectory: string
) {
  try {
    // Read the Prisma schema file
    const prismaSchema = await readFileAsync(prismaSchemaPath, "utf-8");

    // Extract table names from the Prisma schema
    const tableNames = prismaSchema
      .match(/model\s+(\w+)\s+/g)!
      .map((match) => match.split(" ")[1]);

    // Create the output Directory
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }
    // Copy over the root page
    const rootPageName = "page.tsx";

    copyFileToDirectory(
      path.join(__dirname, "templateApp", rootPageName),
      outputDirectory
    );

    const dmmf = await getDMMF({ datamodel: prismaSchema });
    const modelTree = createModelTree(dmmf.datamodel);
    console.log({ modelTree });

    const routes = generateAPIRoutes(modelTree, outputDirectory);

    // For each layer in model tree, create show, list, create, and edit with respect to parent, current, and children node 'partials'

    // modelTree.forEach((mt) => {
    //   console.log(mt.)
    // })

    // TODO
    // For each route
    // Create the directory structure
    // Create relevent page.tsx file in the bottom directory

    // Generate React forms for each table
    // for (const tableName of tableNames) {
    //   const referencedModels = extractReferencedModels(tableName, prismaSchema);
    //   // console.log({ referencedModels });

    //   // Let's just do a flat directory for now
    //   const tableDirectory = path.join(
    //     outputDirectory,
    //     tableName.toLowerCase()
    //   );
    //   copyDirectory(
    //     path.join(__dirname, "templateApp", "nexquikTemplateModel"),
    //     tableDirectory,
    //     true
    //   );

    //   // CreateForm
    //   const createFormCode = await generateCreateForm(
    //     tableName,
    //     prismaSchema,
    //     referencedModels
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     createFormCode,
    //     "{/* @nexquik createForm start */}",
    //     "{/* @nexquik createForm stop */}"
    //   );

    //   // CreateRedirect
    //   const createRedirect = await generateRedirect(
    //     tableName,
    //     prismaSchema,
    //     "created"
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     createRedirect,
    //     "//@nexquik createRedirect start",
    //     "//@nexquik createRedirect stop"
    //   );

    //   // EditForm
    //   const editFormCode = await generateEditForm(
    //     tableName,
    //     prismaSchema,
    //     referencedModels
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     editFormCode,
    //     "{/* @nexquik editForm start */}",
    //     "{/* @nexquik editForm stop */}"
    //   );

    //   // EditRedirect
    //   const editRedirect = await generateRedirect(
    //     tableName,
    //     prismaSchema,
    //     "params"
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     editRedirect,
    //     "//@nexquik editRedirect start",
    //     "//@nexquik editRedirect stop"
    //   );

    //   // HomeForm
    //   const listFormCode = await generateListForm(
    //     tableName,
    //     prismaSchema,
    //     referencedModels
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     listFormCode,
    //     "{/* @nexquik listForm start */}",
    //     "{/* @nexquik listForm stop */}"
    //   );

    //   // ShowForm
    //   const showFormCode = await generateShowForm(
    //     tableName,
    //     prismaSchema,
    //     referencedModels
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     showFormCode,
    //     "{/* @nexquik showForm start */}",
    //     "{/* @nexquik showForm stop */}"
    //   );

    //   // const modelTree = createModelTree(dmmf.datamodel);
    //   const tableFields = await extractTableFields(tableName, prismaSchema);
    //   const uniqueField = tableFields.find((tableField) => tableField.isId);

    //   const prismaInput = generateConvertToPrismaInputCode(
    //     tableFields,
    //     referencedModels
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     prismaInput,
    //     "//@nexquik prismaDataInput start",
    //     "//@nexquik prismaDataInput stop"
    //   );
    //   const identifierField = tableFields.find((field) => field.isId);
    //   const whereClause = generateWhereClause(
    //     "params",
    //     identifierField.name,
    //     identifierField.type
    //   );
    //   addStringBetweenComments(
    //     tableDirectory,
    //     whereClause,
    //     "//@nexquik prismaWhereInput start",
    //     "//@nexquik prismaWhereInput stop"
    //   );

    //   const deleteWhereClause = generateDeleteClause(
    //     identifierField.name,
    //     identifierField.type
    //   );

    //   addStringBetweenComments(
    //     tableDirectory,
    //     deleteWhereClause,
    //     "//@nexquik prismaDeleteClause start",
    //     "//@nexquik prismaDeleteClause stop"
    //   );
    //   findAndReplaceInFiles(tableDirectory, "nexquikTemplateModel", tableName);

    //   // Rename the [id] file to the new unique identifier
    //   fs.renameSync(
    //     path.join(tableDirectory, "[id]"),
    //     path.join(tableDirectory, `[${uniqueField.name}]`)
    //   );
    // }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

export async function extractTableFields(
  tableName: string,
  prismaSchema: string
): Promise<DMMF.Field[]> {
  const dmmf = await getDMMF({ datamodel: prismaSchema });
  const model = dmmf.datamodel.models.find((m) => m.name === tableName);
  if (!model) {
    throw new Error(`Table '${tableName}' not found in the Prisma schema.`);
  }
  return model.fields;
}

export async function generateShowForm(modelTree: ModelTree): Promise<string> {
  const uniqueField = modelTree.model.fields.find(
    (tableField) => tableField.isId
  );
  const uniqueFieldInputType =
    prismaFieldToInputType[uniqueField.type] || "text";

  // Define the React component template as a string
  const reactComponentTemplate = `
    <input hidden type="${uniqueFieldInputType}" name="${
    uniqueField.name
  }" defaultValue={nexquikTemplateModel?.${uniqueField.name}} />
    <form>
    <Link href={\`/nexquikTemplateModel/\`}>Back to All NexquikTemplateModels</Link>
    <Link href={\`/nexquikTemplateModel/\${nexquikTemplateModel.${
      uniqueField.name
    }}/edit\`}>Edit</Link>
    <button formAction={deleteNexquikTemplateModel}>Delete</button>
    ${modelTree.model.fields.map((field) => {
      if (!isFieldRenderable(field)) {
        return "";
      }
      // return `<p> ${name} {nexquikTemplateModel.${name}} </p>`;
      return `<p> ${field.name} {\`\${nexquikTemplateModel.${field.name}}\`} </p>`;
    })}
    </form>
  `;

  return reactComponentTemplate;
}

export function createModelTree(dataModel: DMMF.Datamodel): ModelTree[] {
  const models = dataModel.models;

  // Create a map of models for efficient lookup
  const modelMap: Record<string, DMMF.Model> = {};
  for (const model of models) {
    modelMap[model.name] = model;
  }

  const visitedModels: Set<string> = new Set();
  const modelTrees: ModelTree[] = [];

  // Function to recursively build the model tree
  function buildModelTree(model: DMMF.Model, parent?: DMMF.Model): ModelTree {
    if (visitedModels.has(model.name)) {
      throw new Error(`Circular relationship detected in model: ${model.name}`);
    }

    visitedModels.add(model.name);

    const childRelationships = model.fields.filter(
      (field) => field.kind === "object" && field.isList
    );

    const children: ModelTree[] = [];
    for (const relationship of childRelationships) {
      const childModel = modelMap[relationship.type];
      if (childModel) {
        const childNode = buildModelTree(childModel, model);
        children.push(childNode);
      }
    }

    visitedModels.delete(model.name);
    const uniqueIdField = model.fields.find((field) => field.isId === true);
    return {
      modelName: model.name,
      model: model,
      parent: parent,
      uniqueIdentifierField: uniqueIdField,
      children,
    };
  }

  for (const model of models) {
    if (
      !model.fields.some(
        (field) => field.kind === "object" && field.isRequired && !field.isList
      )
    ) {
      const modelTree = buildModelTree(model);
      modelTrees.push(modelTree);
    }
  }

  return modelTrees;
}

function prettyPrintAPIRoutes(routes: RouteObject[]) {
  console.log("API Routes:");
  console.log("-----------");

  for (const route of routes) {
    console.log(
      `${route.segment} - ${route.operation} ${route.model}: ${route.description}`
    );
  }
}

const getDynamicSlug = (modelName: string, uniqueIdFieldName: string) => {
  return `${modelName}${uniqueIdFieldName}`;
};
export function generateAPIRoutes(
  modelTreeArray: ModelTree[],
  outputDirectory: string
): RouteObject[] {
  const routes: RouteObject[] = [];

  async function generateRoutes(
    modelTree: ModelTree,
    parentRoute: { name: string; uniqueIdentifierField?: string }
  ) {
    const modelName = modelTree.modelName;
    const modelUniqueIdentifierField = modelTree.uniqueIdentifierField;
    console.log("parentRoute", parentRoute.name);
    const route =
      parentRoute.name +
      (parentRoute.name === "/"
        ? ""
        : `/[${getDynamicSlug(
            modelTree.parent.name,
            parentRoute.uniqueIdentifierField
          )}]/`) +
      modelName.charAt(0).toLowerCase() +
      modelName.slice(1);

    const directoryToCreate = path.join(outputDirectory, route);
    console.log(`Create directory: ${directoryToCreate}`);
    if (!fs.existsSync(directoryToCreate)) {
      fs.mkdirSync(directoryToCreate);
    }

    // START GENERATION
    // #############
    const uniqueDynamicSlug = getDynamicSlug(
      modelTree.modelName,
      modelUniqueIdentifierField.name
    );
    console.log({ uniqueDynamicSlug });

    // Copy over template directory
    // Rename [id] directory to modelUniqueIdentifierField
    // Fill in partials
    copyDirectory(
      path.join(__dirname, "templateApp", "nexquikTemplateModel"),
      directoryToCreate,
      true
    );

    const dir = fs.readdirSync(directoryToCreate);
    console.log({ dir });
    fs.renameSync(
      path.join(directoryToCreate, "[id]"),
      path.join(directoryToCreate, `[${uniqueDynamicSlug}]`)
    );

    // Create List Page
    // TODO: In list form, we need to dynamically inject the path to create, show, edit, and destroy
    // Can we just router.push something?
    const listFormCode = await generateListForm2(modelTree);
    addStringBetweenComments(
      directoryToCreate,
      listFormCode,
      "{/* @nexquik listForm start */}",
      "{/* @nexquik listForm stop */}"
    );
    const deleteWhereClause = generateDeleteClause(
      modelTree.uniqueIdentifierField.name,
      modelTree.uniqueIdentifierField.type
    );

    addStringBetweenComments(
      directoryToCreate,
      deleteWhereClause,
      "//@nexquik prismaDeleteClause start",
      "//@nexquik prismaDeleteClause stop"
    );

    // ShowForm
    const showFormCode = await generateShowForm(modelTree);
    addStringBetweenComments(
      directoryToCreate,
      showFormCode,
      "{/* @nexquik showForm start */}",
      "{/* @nexquik showForm stop */}"
    );

    // CreateForm
    const createFormCode = await generateCreateForm(modelTree);
    addStringBetweenComments(
      directoryToCreate,
      createFormCode,
      "{/* @nexquik createForm start */}",
      "{/* @nexquik createForm stop */}"
    );

    // CreateRedirect
    const createRedirect = await generateRedirect(
      modelTree.uniqueIdentifierField.name,
      "created"
    );
    addStringBetweenComments(
      directoryToCreate,
      createRedirect,
      "//@nexquik createRedirect start",
      "//@nexquik createRedirect stop"
    );

    // EditForm
    const editFormCode = await generateEditForm(modelTree);
    addStringBetweenComments(
      directoryToCreate,
      editFormCode,
      "{/* @nexquik editForm start */}",
      "{/* @nexquik editForm stop */}"
    );

    // EditRedirect
    const editRedirect = await generateRedirect(uniqueDynamicSlug, "params");
    addStringBetweenComments(
      directoryToCreate,
      editRedirect,
      "//@nexquik editRedirect start",
      "//@nexquik editRedirect stop"
    );

    findAndReplaceInFiles(
      directoryToCreate,
      "nexquikTemplateModel",
      modelTree.modelName
    );

    const prismaInput = generateConvertToPrismaInputCode(
      modelTree.model.fields
    );
    addStringBetweenComments(
      directoryToCreate,
      prismaInput,
      "//@nexquik prismaDataInput start",
      "//@nexquik prismaDataInput stop"
    );
    const identifierField = modelTree.model.fields.find((field) => field.isId);
    const whereClause = generateWhereClause(
      "params",
      uniqueDynamicSlug,
      identifierField.type,
      identifierField.name
    );
    addStringBetweenComments(
      directoryToCreate,
      whereClause,
      "//@nexquik prismaWhereInput start",
      "//@nexquik prismaWhereInput stop"
    );

    // END GENERATION
    // #############
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
        modelTree.uniqueIdentifierField.name
      )}]/edit`,
      model: modelName,
      operation: "Edit",
      description: `Edit a ${modelName} by ID`,
    });

    // Show
    routes.push({
      segment: `${route}/[${getDynamicSlug(
        modelName,
        modelTree.uniqueIdentifierField.name
      )}]`,
      model: modelName,
      operation: "Show",
      description: `Get details of a ${modelName} by ID`,
    });

    // Create ./[id]/page.tsx

    // List
    routes.push({
      segment: route,
      model: modelName,
      operation: "List",
      description: `Get a list of ${modelName}s`,
    });
    // Create ./page.tsx

    for (const child of modelTree.children) {
      generateRoutes(child, {
        name: route,
        uniqueIdentifierField: modelUniqueIdentifierField.name,
      });
    }
  }

  for (const modelTree of modelTreeArray) {
    generateRoutes(modelTree, {
      name: "/",
      uniqueIdentifierField: "",
    });
  }

  prettyPrintAPIRoutes(routes);
  return routes;
}

export function generateConvertToPrismaInputCode(
  tableFields: DMMF.Field[]
): string {
  // console.log({ referencedModels });
  const convertToPrismaInputLines = tableFields
    .filter(({ isId }) => !isId)
    .filter((field) => isFieldRenderable(field))
    .map(({ name, type }) => {
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

  return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}

export function generateWhereClause(
  inputObject: string,
  identifierFieldName: string,
  identifierFieldType: string,
  modelUniqueIdField: string
): string {
  let typecastValue = `${inputObject}.${identifierFieldName}`;
  if (identifierFieldType === "Int" || identifierFieldType === "Float") {
    typecastValue = `Number(${typecastValue})`;
  } else if (identifierFieldType === "Boolean") {
    typecastValue = `Boolean(${typecastValue})`;
  }

  return `{ ${modelUniqueIdField}: ${typecastValue} },`;
}

export function generateDeleteClause(
  identifierFieldName: string,
  identifierFieldType: string
): string {
  let typecastValue = `formData.get('${identifierFieldName}')`;
  if (identifierFieldType === "Int" || identifierFieldType === "Float") {
    typecastValue = `Number(${typecastValue})`;
  } else if (identifierFieldType === "Boolean") {
    typecastValue = `Boolean(${typecastValue})`;
  }

  return `{ ${identifierFieldName}: ${typecastValue} },`;
}

// Custom export function to check if field is renderable in a form
export function isFieldRenderable(field: DMMF.Field): boolean {
  return !(field.isReadOnly || field.isList || !!field.relationName);
}
export function generateFormFields(
  tableFields: DMMF.Field[]
  // referencedModels: { fieldName: string; referencedModel: string }[]
): string {
  return tableFields
    .map((field) => {
      if (!isFieldRenderable(field) || field.isId) {
        return "";
      }
      const inputType = prismaFieldToInputType[field.type] || "text";
      const required = field.isRequired ? "required" : "";

      return `<label>${field.name}</label>\n
        <input type="${inputType}" name="${field.name}" ${required}/>`;
    })
    .join("\n");
}

export function generateFormFieldsWithDefaults(
  tableFields: DMMF.Field[]
  // referencedModels: { fieldName: string; referencedModel: string }[]
): string {
  return tableFields
    .map((field) => {
      if (!isFieldRenderable(field)) {
        return "";
      }
      const inputType = prismaFieldToInputType[field.type] || "text";
      const defaultValue = field.isId
        ? `{nexquikTemplateModel.${field.name} || 'N/A'}`
        : `{nexquikTemplateModel.${field.name}}`;
      const disabled = field.isId ? "disabled" : "";
      const required = field.isRequired ? "required" : "";

      return `<label>${field.name}</label>\n<input type="${inputType}" name="${field.name}" value=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}
