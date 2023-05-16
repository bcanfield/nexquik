#! /usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
// import fs from "fs";
import { Block } from "@mrleebo/prisma-ast";
import path from "path";
import prettier from "prettier";
const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
import { getDMMF } from "@prisma/internals";

const nexquikTemplateModel = "nexquikTemplateModel";
export type PrismaSchemaSectionType = {
  name: string;
  value: Block;
};

function generateConvertToPrismaInputCode(
  tableFields: TableField[],
  referencedModels: { fieldName: string; referencedModel: string }[]
): string {
  // console.log({ referencedModels });
  const convertToPrismaInputLines = tableFields
    .filter(({ isId }) => !isId)
    .filter(
      ({ name }) =>
        !referencedModels.some(({ fieldName }) => name === fieldName)
    )
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

function generateWhereClause(
  inputObject: string,
  identifierFieldName: string,
  identifierFieldType: string
): string {
  let typecastValue = `${inputObject}.${identifierFieldName}`;
  if (identifierFieldType === "Int" || identifierFieldType === "Float") {
    typecastValue = `Number(${typecastValue})`;
  } else if (identifierFieldType === "Boolean") {
    typecastValue = `Boolean(${typecastValue})`;
  }

  return `{ ${identifierFieldName}: ${typecastValue} },`;
}

function generateDeleteClause(
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

const formatNextJsFilesRecursively = async (directory) => {
  try {
    // Get a list of all files and directories in the current directory
    const entries = await fs.promises.readdir(directory);

    for (const entry of entries) {
      const entryPath = path.join(directory, entry);

      // Check if the entry is a file
      const isFile = (await fs.promises.stat(entryPath)).isFile();

      if (isFile) {
        // Filter the file to include only Next.js files (e.g., .js, .jsx, .ts, .tsx)
        if (/\.(jsx?|tsx?)$/.test(path.extname(entry))) {
          const fileContents = await fs.promises.readFile(entryPath, "utf8");

          // Format the file contents using Prettier
          const formattedContents = prettier.format(fileContents, {
            parser: "babel-ts", // Specify the parser according to your project's configuration
          });

          // Write the formatted contents back to the file
          await fs.promises.writeFile(entryPath, formattedContents);
        }
      } else {
        // If the entry is a directory, recursively call the function for that directory
        await formatNextJsFilesRecursively(entryPath);
      }
    }
  } catch (error) {
    console.error("An error occurred while formatting files:", error);
  }
};

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function findAndReplaceInFiles(
  directoryPath: string,
  searchString: string,
  replacementString: string
): void {
  // Read the directory contents
  const files = fs.readdirSync(directoryPath);

  // Iterate through all files and directories
  // Iterate through all files and directories
  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    // Check if the path is a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively search and replace in subdirectories
      findAndReplaceInFiles(filePath, searchString, replacementString);
    } else {
      // Read the file content
      let fileContent = fs.readFileSync(filePath, "utf-8");

      // Perform case-insensitive find and replace
      const pattern = new RegExp(searchString, "gi");
      fileContent = fileContent.replace(pattern, (match) => {
        // Preserve the casing of the first character
        const firstChar = match.charAt(0);
        const replacementFirstChar = replacementString.charAt(0);
        const replacedFirstChar =
          firstChar === firstChar.toLowerCase()
            ? replacementFirstChar.toLowerCase()
            : firstChar === firstChar.toUpperCase()
            ? replacementFirstChar.toUpperCase()
            : replacementFirstChar;
        return replacedFirstChar + replacementString.slice(1);
      });

      // Write the modified content back to the file
      fs.writeFileSync(filePath, fileContent, "utf-8");
    }
  }
}

function copyFileToDirectory(
  sourcePath: string,
  destinationDirectory: string
): void {
  const fileName = path.basename(sourcePath);
  const destinationPath = path.join(destinationDirectory, fileName);

  const readStream = fs.createReadStream(sourcePath);
  const writeStream = fs.createWriteStream(destinationPath);

  readStream.on("error", (error) => {
    console.error(`Error reading file: ${error}`);
  });

  writeStream.on("error", (error) => {
    console.error(`Error writing file: ${error}`);
  });

  writeStream.on("finish", () => {
    console.log(`File "${fileName}" copied to "${destinationDirectory}"`);
  });

  readStream.pipe(writeStream);
}

const preserveCase = (
  originalString: string,
  searchString: string,
  replacementString: string
): string => {
  const isUpperCase = originalString === originalString.toUpperCase();
  const isLowerCase = originalString === originalString.toLowerCase();

  if (isUpperCase) {
    return replacementString.toUpperCase();
  } else if (isLowerCase) {
    return replacementString.toLowerCase();
  } else if (searchString.charAt(0).toUpperCase() === searchString.charAt(0)) {
    return (
      replacementString.charAt(0).toUpperCase() + replacementString.slice(1)
    );
  } else {
    return replacementString;
  }
};
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

const prismaFieldToInputType: Record<string, string> = {
  Int: "number",
  Float: "number",
  String: "text",
  Boolean: "checkbox",
  DateTime: "datetime-local",
  Json: "text",
};

interface TableField {
  name: string;
  type: string;
  isId: boolean;
  isRequired: boolean;
  // mapType: string;
}

function extractReferencedModels(
  model: string,
  prismaSchema: string
): { fieldName: string; referencedModel: string }[] {
  const referencedFields: { fieldName: string; referencedModel: string }[] = [];
  const modelRegex = new RegExp(`model\\s+${model}\\s+{([\\s\\S]+?)}`, "g");
  const fieldRegex = /(\w+)\s+(\w+)(\?|\s+)?(\@\id)?(\@\map\((.+)\))?/g;

  const match = modelRegex.exec(prismaSchema);
  if (match) {
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(match[1]))) {
      const [, fieldName, fieldType] = fieldMatch;
      if (fieldType && prismaSchema.includes(`model ${fieldType}`)) {
        referencedFields.push({ fieldName, referencedModel: fieldType });
      }
    }
  }

  return referencedFields;
}
async function generateReactForms(
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

    // Generate React forms for each table
    for (const tableName of tableNames) {
      const referencedModels = extractReferencedModels(tableName, prismaSchema);
      // console.log({ referencedModels });

      // Let's just do a flat directory for now
      const tableDirectory = path.join(
        outputDirectory,
        tableName.toLowerCase()
      );
      copyDirectory(
        path.join(__dirname, "templateApp", "nexquikTemplateModel"),
        tableDirectory,
        true
      );

      // CreateForm
      const createFormCode = await generateCreateForm(
        tableName,
        prismaSchema,
        referencedModels
      );
      addStringBetweenComments(
        tableDirectory,
        createFormCode,
        "{/* @nexquik createForm start */}",
        "{/* @nexquik createForm stop */}"
      );

      // CreateRedirect
      const createRedirect = await generateRedirect(
        tableName,
        prismaSchema,
        "created"
      );
      addStringBetweenComments(
        tableDirectory,
        createRedirect,
        "//@nexquik createRedirect start",
        "//@nexquik createRedirect stop"
      );

      // EditForm
      const editFormCode = await generateEditForm(
        tableName,
        prismaSchema,
        referencedModels
      );
      addStringBetweenComments(
        tableDirectory,
        editFormCode,
        "{/* @nexquik editForm start */}",
        "{/* @nexquik editForm stop */}"
      );

      // EditRedirect
      const editRedirect = await generateRedirect(
        tableName,
        prismaSchema,
        "params"
      );
      addStringBetweenComments(
        tableDirectory,
        editRedirect,
        "//@nexquik editRedirect start",
        "//@nexquik editRedirect stop"
      );

      // HomeForm
      const listFormCode = await generateListForm(
        tableName,
        prismaSchema,
        referencedModels
      );
      addStringBetweenComments(
        tableDirectory,
        listFormCode,
        "{/* @nexquik listForm start */}",
        "{/* @nexquik listForm stop */}"
      );

      // ShowForm
      const showFormCode = await generateShowForm(
        tableName,
        prismaSchema,
        referencedModels
      );
      addStringBetweenComments(
        tableDirectory,
        showFormCode,
        "{/* @nexquik showForm start */}",
        "{/* @nexquik showForm stop */}"
      );

      const tableFields = await extractTableFields(tableName, prismaSchema);
      const uniqueField = tableFields.find((tableField) => tableField.isId);

      const prismaInput = generateConvertToPrismaInputCode(
        tableFields,
        referencedModels
      );
      addStringBetweenComments(
        tableDirectory,
        prismaInput,
        "//@nexquik prismaDataInput start",
        "//@nexquik prismaDataInput stop"
      );
      const identifierField = tableFields.find((field) => field.isId);
      const whereClause = generateWhereClause(
        "params",
        identifierField.name,
        identifierField.type
      );
      addStringBetweenComments(
        tableDirectory,
        whereClause,
        "//@nexquik prismaWhereInput start",
        "//@nexquik prismaWhereInput stop"
      );

      const deleteWhereClause = generateDeleteClause(
        identifierField.name,
        identifierField.type
      );

      addStringBetweenComments(
        tableDirectory,
        deleteWhereClause,
        "//@nexquik prismaDeleteClause start",
        "//@nexquik prismaDeleteClause stop"
      );
      findAndReplaceInFiles(tableDirectory, "nexquikTemplateModel", tableName);

      // Rename the [id] file to the new unique identifier
      fs.renameSync(
        path.join(tableDirectory, "[id]"),
        path.join(tableDirectory, `[${uniqueField.name}]`)
      );
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

async function generateCreateForm(
  tableName: string,
  prismaSchema: string,
  referencedModels: { fieldName: string; referencedModel: string }[]
): Promise<string> {
  const tableFields = await extractTableFields(tableName, prismaSchema);
  // console.log({ tableFields });
  const formFields = generateFormFields(tableFields, referencedModels);
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
  tableName: string,
  prismaSchema: string,
  dataObjectName: string
): Promise<string> {
  const tableFields = await extractTableFields(tableName, prismaSchema);
  // console.log({ tableName });
  const uniqueField = tableFields.find((tableField) => tableField.isId);
  // Define the React component template as a string
  const reactComponentTemplate = `
  redirect(\`/nexquikTemplateModel/\${${dataObjectName}.${uniqueField.name}}\`);
`;
  return reactComponentTemplate;
}

async function generateEditForm(
  tableName: string,
  prismaSchema: string,
  referencedModels: { fieldName: string; referencedModel: string }[]
): Promise<string> {
  const tableFields = await extractTableFields(tableName, prismaSchema);
  const formFields = generateFormFieldsWithDefaults(
    tableFields,
    referencedModels
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

async function generateListForm(
  tableName: string,
  prismaSchema: string,
  referencedModels: { fieldName: string; referencedModel: string }[]
): Promise<string> {
  const tableFields = await (
    await extractTableFields(tableName, prismaSchema)
  ).filter((tf) => !referencedModels.some((rm) => rm.fieldName === tf.name));
  const uniqueField = tableFields.find((tableField) => tableField.isId);
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
  }} />        ${tableFields.map(({ name }) => {
    return `<p> ${name} {\`\${nexquikTemplateModel.${name}}\`} </p>`;
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

async function generateShowForm(
  tableName: string,
  prismaSchema: string,
  referencedModels: { fieldName: string; referencedModel: string }[]
): Promise<string> {
  const tableFields = await extractTableFields(tableName, prismaSchema);
  const formFields = generateFormFields(tableFields, referencedModels);

  const uniqueField = tableFields.find((tableField) => tableField.isId);
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
  ${tableFields.map(({ name, isId }) => {
    if (isId || referencedModels.some((model) => model.fieldName === name)) {
      return "";
    }
    // return `<p> ${name} {nexquikTemplateModel.${name}} </p>`;
    return `<p> ${name} {\`\${nexquikTemplateModel.${name}}\`} </p>`;
  })}
  </form>
`;

  return reactComponentTemplate;
}

async function extractTableFields(
  tableName: string,
  prismaSchema: string
): Promise<TableField[]> {
  const dmmf = await getDMMF({ datamodel: prismaSchema });

  const model = dmmf.datamodel.models.find((m) => m.name === tableName);
  if (!model) {
    throw new Error(`Table '${tableName}' not found in the Prisma schema.`);
  }

  console.log("fields", model.fields);
  const tableFields: TableField[] = model.fields.map((field) => ({
    name: field.name,
    type: field.type,
    isId: field.isId,
    isRequired: field.isRequired,
  }));

  // console.log({ tableFields });
  return tableFields;
}

function generateFormFields(
  tableFields: TableField[],
  referencedModels: { fieldName: string; referencedModel: string }[]
): string {
  return tableFields
    .map(({ name, type, isRequired, isId }) => {
      if (isId || referencedModels.some((model) => model.fieldName === name)) {
        return "";
      }
      const inputType = prismaFieldToInputType[type] || "text";
      const required = isRequired ? "required" : "";

      return `<label>${name}</label>\n
      <input type="${inputType}" name="${name}" ${required}/>`;
    })
    .join("\n");
}

function generateFormFieldsWithDefaults(
  tableFields: TableField[],
  referencedModels: { fieldName: string; referencedModel: string }[]
): string {
  return tableFields
    .map(({ name, type, isId, isRequired }) => {
      if (referencedModels.some((model) => model.fieldName === name)) {
        return "";
      }
      const inputType = prismaFieldToInputType[type] || "text";
      const defaultValue = isId
        ? `{nexquikTemplateModel.${name} || 'N/A'}`
        : `{nexquikTemplateModel.${name}}`;
      const disabled = isId ? "disabled" : "";
      const required = isRequired ? "required" : "";

      return `<label>${name}</label>\n<input type="${inputType}" name="${name}" value=${defaultValue}  ${disabled} ${required}/>`;
    })
    .join("\n");
}

async function main() {
  const program = new Command();
  const defaultPrismaSchemaPath = "./prisma/schema.prisma";
  const defaultPrismaClientImportPath = "~/server/db";
  const defaultOutputDirectory = "nexquikApp";

  console.log(figlet.textSync("Nexquik"));

  program
    .version(require("../package.json").version)
    .description("An example CLI for managing a directory")
    .option(
      "-schema <value>",
      "Path to prisma schema file",
      defaultPrismaSchemaPath
    )
    .option("-out <value>", "Path to output directory", defaultOutputDirectory)
    .option(
      "-prismaImport <value>",
      "String to use for Prisma Import",
      defaultPrismaClientImportPath
    )
    .parse(process.argv);

  const options = program.opts();
  if (options.Schema && options.Out) {
    console.log(
      `${chalk.green.bold(
        `Looking for Prisma Schema at: ${options.Schema}`
      )}\n${chalk.cyanBright.bold(
        `Outputting generated files to: ${options.Out}`
      )}\n${chalk.blue.bold(`Prisma Import Value: ${options.PrismaImport}`)}`
    );
    await generateReactForms(options.Schema, options.Out);
    await formatNextJsFilesRecursively(options.Out);
  }
}

main().then(() => {
  console.log("Done.");
});
