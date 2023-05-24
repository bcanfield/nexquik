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

async function generateCreateForm(
  modelTree: ModelTree,
  routeUrl: string,
  enums: Record<string, string[]>
): Promise<string> {
  const formFields = generateFormFields(modelTree, enums);
  const reactComponentTemplate = `
      <form action={addNexquikTemplateModel}>
        ${formFields}
        <button type="submit">Create NexquikTemplateModel</button>
      </form>
      <Link href={\`${routeUrl}\`}>Cancel</Link>
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
  const reactComponentTemplate = `
  <Link href={\`${linkUrl}\`}>
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
        <button type="submit">Update NexquikTemplateModel</button>
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
  const slug = getDynamicSlug(
    modelTree.model.name,
    modelTree.uniqueIdentifierField.name
  );
  const childrenLinks = modelTree.children
    .map(
      (c) => `<Link href={\`${routeUrl}/\${params.${slug}}/${
        c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)
      }\`}>
    ${c.modelName} List
</Link>`
    )
    .join("\n");
  return childrenLinks;
}
``;
async function generateListForm2(
  modelTree: ModelTree,
  routeUrl: string
): Promise<string> {
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
          <Link href={\`${routeUrl}/\${nexquikTemplateModel.${
    uniqueField.name
  }}\`}>View</Link>
          <Link href={\`${routeUrl}/\${nexquikTemplateModel.${
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
    const enums = getEnums(dmmf.datamodel);
    console.log({ enums });

    const routes = generateAPIRoutes(modelTree, outputDirectory, enums);
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

export async function generateShowForm(
  modelTree: ModelTree,
  routeUrl: string
): Promise<string> {
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
    <Link href={\`${routeUrl}\`}>Back to All NexquikTemplateModels</Link>
    <Link href={\`${routeUrl}/\${nexquikTemplateModel.${
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

function getParentReferenceField(modelTree: ModelTree): string | undefined {
  if (!modelTree.parent) {
    return undefined;
  }

  const parentModel = modelTree.model;
  const parentField = parentModel.fields.find(
    (field) => field.type === modelTree.parent.name
  );

  if (!parentField) {
    return undefined;
  }

  // Find the unique ID field in the current model that matches the parent reference field
  const uniqueIdField = modelTree.model.fields.find(
    (field) => field.name === parentField.name
  );

  return uniqueIdField?.name;
}
const getDynamicSlug = (modelName: string, uniqueIdFieldName: string) => {
  return `${modelName}${uniqueIdFieldName}`;
};
function convertRouteToRedirectUrl(input: string): string {
  const regex = /\[(.*?)\]/g;
  const replaced = input.replace(regex, (_, innerValue) => {
    return `\${params.${innerValue}}`;
  });

  return `${replaced}`;
}
export function generateAPIRoutes(
  modelTreeArray: ModelTree[],
  outputDirectory: string,
  enums: Record<string, string[]>
): RouteObject[] {
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
            modelTree.parent.name,
            parentRoute.uniqueIdentifierField
          )}]/`) +
      modelName.charAt(0).toLowerCase() +
      modelName.slice(1);

    const directoryToCreate = path.join(outputDirectory, route);
    // console.log(`Create directory: ${directoryToCreate}`);
    if (!fs.existsSync(directoryToCreate)) {
      fs.mkdirSync(directoryToCreate);
    }

    // START GENERATION
    // #############
    const uniqueDynamicSlug = getDynamicSlug(
      modelTree.modelName,
      modelUniqueIdentifierField.name
    );
    // console.log({ uniqueDynamicSlug });

    // Copy over template directory
    // Rename [id] directory to modelUniqueIdentifierField
    // Fill in partials
    copyDirectory(
      path.join(__dirname, "templateApp", "nexquikTemplateModel"),
      directoryToCreate,
      true
    );

    // console.log({ dir });
    fs.renameSync(
      path.join(directoryToCreate, "[id]"),
      path.join(directoryToCreate, `[${uniqueDynamicSlug}]`)
    );

    // Create List Page
    // TODO: In list form, we need to dynamically inject the path to create, show, edit, and destroy
    // TODO: In child list component (sessions) get sessions where userId = params.UserId
    // Can we just router.push something?
    const listFormCode = await generateListForm2(
      modelTree,
      convertRouteToRedirectUrl(route)
    );
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

    // CreateForm
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

    // CreateRedirect
    const createRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}/\${created.${
        modelTree.uniqueIdentifierField.name
      }}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      createRedirect,
      "//@nexquik createRedirect start",
      "//@nexquik createRedirect stop"
    );

    // CreateRedirect
    const listRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      listRedirect,
      "//@nexquik listRedirect start",
      "//@nexquik listRedirect stop"
    );

    // RevalidatePath
    const revalidatePath = await generateRevalidatePath(
      `${convertRouteToRedirectUrl(route)}`
    );
    addStringBetweenComments(
      directoryToCreate,
      revalidatePath,
      "//@nexquik revalidatePath start",
      "//@nexquik revalidatePath stop"
    );

    // CreateLink
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

    // EditForm
    const editFormCode = await generateEditForm(modelTree, enums);
    addStringBetweenComments(
      directoryToCreate,
      editFormCode,
      "{/* @nexquik editForm start */}",
      "{/* @nexquik editForm stop */}"
    );

    // EditRedirect
    const editRedirect = await generateRedirect(
      `\`${convertRouteToRedirectUrl(route)}/\${params.${uniqueDynamicSlug}}\``
    );
    addStringBetweenComments(
      directoryToCreate,
      editRedirect,
      "//@nexquik editRedirect start",
      "//@nexquik editRedirect stop"
    );

    // ChildrenList
    // Get Child Models
    // Link to the child model list page
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

    findAndReplaceInFiles(
      directoryToCreate,
      "nexquikTemplateModel",
      modelTree.modelName
    );

    const prismaInput = generateConvertToPrismaInputCode(modelTree);
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

    // Where parent clause
    const parentIdentifierField = modelTree.model.fields.find(
      (field) => field.isId
    );
    const whereparentClause = modelTree.parent
      ? generateWhereParentClause(
          "params",
          getDynamicSlug(modelTree.parent.name, parentIdentifierField.name),
          parentIdentifierField.name,
          parentIdentifierField.type,
          getParentReferenceField(modelTree)
        )
      : "()";
    addStringBetweenComments(
      directoryToCreate,
      whereparentClause,
      "//@nexquik prismaWhereParentClause start",
      "//@nexquik prismaWhereParentClause stop"
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

export function generateConvertToPrismaInputCode(modelTree: ModelTree): string {
  // If model has a parent, get the parent accessor
  let relationFieldToParent = "";
  let fieldType = "";
  if (modelTree.parent) {
    // Get the field on the current model that is the id referencing the parent
    modelTree.model.fields.forEach((mf) => {
      if (mf.type === modelTree.parent.name) {
        if (mf.relationFromFields.length > 0) {
          relationFieldToParent = mf.relationFromFields[0];
        }
      }
    });

    // Get the field type on the current model that is the id referencing the parent
    fieldType = modelTree.model.fields.find(
      (f) => f.name === relationFieldToParent
    )?.type;
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
  if (relationFieldToParent && fieldType) {
    // Get the parent unique slug
    const parentIdentifierField = modelTree.model.fields.find(
      (field) => field.isId
    );
    const parentSlug = getDynamicSlug(
      modelTree.parent.name,
      parentIdentifierField.name
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
      console.log(
        `Field '${field.name}' in model '${modelTree.modelName}' is a relation.`
      );
      const relationFrom = field.relationFromFields[0];
      console.log(`relationFrom: ${relationFrom}`);

      const referencedModelName = field.type;

      if (referencedModelName === modelTree.parent?.name) {
        console.log(
          `Field '${field.name}' is a reference to the parent model.`
        );
      } else if (relationFrom) {
        const fieldType2 = modelTree.model.fields.find(
          (f) => f.name === relationFrom
        ).type;

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
  inputObject: string,
  fieldAccessValue: string,
  parentIdentifierFieldName: string,
  parentIdentifierFieldType: string,
  parentReferenceField: string
): string {
  let typecastValue = `${inputObject}.${fieldAccessValue}`;
  if (
    parentIdentifierFieldType === "Int" ||
    parentIdentifierFieldType === "Float"
  ) {
    typecastValue = `Number(${typecastValue})`;
  } else if (parentIdentifierFieldType === "Boolean") {
    typecastValue = `Boolean(${typecastValue})`;
  }
  // const parentModelNameLowerCase =
  //   parentModelName.charAt(0).toLowerCase() + parentModelName.slice(1);
  return `({ where: { ${parentReferenceField}: {${parentIdentifierFieldName}: {equals: ${typecastValue}} } } })`;
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
        console.log(
          `Field '${field.name}' in model '${modelTree.modelName}' is a relation.`
        );
        const relationFrom = field.relationFromFields[0];
        console.log(`relationFrom: ${relationFrom}`);

        const referencedModelName = field.type;

        if (referencedModelName === modelTree.parent?.name) {
          console.log(
            `Field '${field.name}' is a reference to the parent model.`
          );
        } else if (relationFrom) {
          const fieldType2 = modelTree.model.fields.find(
            (f) => f.name === relationFrom
          ).type;
          const inputType2 = prismaFieldToInputType[fieldType2] || "text";

          return `<label>${relationFrom}</label>\n
            <input type="${inputType2}" name="${relationFrom}" ${required}/>`;
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
  // referencedModels: { fieldName: string; referencedModel: string }[]
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
        : `{nexquikTemplateModel.${field.name}}`;
      const disabled = field.isId ? "disabled" : "";
      const required = field.isRequired ? "required" : "";

      return `<label>${field.name}</label>\n<input type="${inputType}" name="${field.name}" defaultValue=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}
