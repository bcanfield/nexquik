#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFormFieldsWithDefaults = exports.generateFormFields = exports.isFieldRenderable = exports.generateDeleteClause = exports.generateWhereClause = exports.generateWhereParentClause = exports.generateConvertToPrismaInputCode = exports.generateAppDirectoryFromModelTree = exports.generateShowForm = exports.generate = exports.prismaFieldToInputType = void 0;
const internals_1 = require("@prisma/internals");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const helpers_1 = require("./helpers");
const modelTree_1 = require("./modelTree");
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
exports.prismaFieldToInputType = {
    Int: "number",
    Float: "number",
    String: "text",
    Boolean: "checkbox",
    DateTime: "datetime-local",
    Json: "text",
};
function addStringBetweenComments(directory, insertString, startComment, endComment) {
    const files = fs_1.default.readdirSync(directory);
    files.forEach((file) => {
        const filePath = path_1.default.join(directory, file);
        // Check if the file is a directory
        if (fs_1.default.statSync(filePath).isDirectory()) {
            // Recursively process subdirectories
            addStringBetweenComments(filePath, insertString, startComment, endComment);
        }
        else {
            // Read file contents
            let fileContent = fs_1.default.readFileSync(filePath, "utf8");
            // Check if both comments exist in the file
            while (fileContent.includes(startComment) &&
                fileContent.includes(endComment)) {
                // Replace the content between the comments and the comments themselves with the insert string
                const startIndex = fileContent.indexOf(startComment);
                const endIndex = fileContent.indexOf(endComment) + endComment.length;
                const contentToRemove = fileContent.slice(startIndex, endIndex);
                fileContent = fileContent.replace(contentToRemove, insertString);
            }
            // Write the modified content back to the file
            fs_1.default.writeFileSync(filePath, fileContent);
        }
    });
}
function generateCreateForm(modelTree, routeUrl, enums) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function generateRedirect(redirectUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const reactComponentTemplate = `
    redirect(${redirectUrl});
  `;
        return reactComponentTemplate;
    });
}
function generateLink(linkUrl, linkText) {
    return __awaiter(this, void 0, void 0, function* () {
        const reactComponentTemplate = `
  <Link href={\`${linkUrl}\`} className="base-link">
  ${linkText}
</Link>  `;
        return reactComponentTemplate;
    });
}
function generateRevalidatePath(revalidationUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const reactComponentTemplate = `
    revalidatePath(\`${revalidationUrl}\`);
  `;
        return reactComponentTemplate;
    });
}
function generateEditForm(modelTree, routeUrl, enums) {
    return __awaiter(this, void 0, void 0, function* () {
        // const tableFields = await extractTableFields(tableName, prismaSchema);
        const formFields = generateFormFieldsWithDefaults(modelTree.model.fields, enums);
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
    });
}
``;
function getEnums(datamodel) {
    const enums = {};
    for (const enumDef of datamodel.enums) {
        const enumName = enumDef.name;
        const enumValues = enumDef.values.map((value) => value.name);
        enums[enumName] = enumValues;
    }
    return enums;
}
function generateChildrenList(modelTree, routeUrl) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Define the React component template as a string
        const slug = ((_a = modelTree.uniqueIdentifierField) === null || _a === void 0 ? void 0 : _a.name) &&
            (0, helpers_1.getDynamicSlug)(modelTree.model.name, modelTree.uniqueIdentifierField.name);
        const childrenLinks = modelTree.children
            .map((c) => `<Link className="action-link base-link" href={\`${routeUrl}/\${params.${slug}}/${c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)}\`}>
    ${c.modelName} List
</Link>`)
            .join("\n");
        return childrenLinks;
    });
}
``;
function generateListForm2(modelTree, routeUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueField = modelTree.model.fields.find((tableField) => tableField.isId);
        const uniqueFieldInputType = ((uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.type) && exports.prismaFieldToInputType[uniqueField.type]) || "text";
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
      <input hidden type="${uniqueFieldInputType}" name="${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}" defaultValue={nexquikTemplateModel?.${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}} />
          <Link href={\`${routeUrl}/\${nexquikTemplateModel.${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}}\`} className="action-link view-link">View</Link>
                  <Link href={\`${routeUrl}/\${nexquikTemplateModel.${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}}/edit\`} className="action-link edit-link">Edit</Link>
                  <button formAction={deleteNexquikTemplateModel} className="action-link delete-link">Delete</button>
                  </form>

                  </td>
      </tr>
  
    ))}
    </tbody>
    </table>
    `;
        return reactComponentTemplate;
    });
}
function generate(prismaSchemaPath, outputDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read the Prisma schema file
            console.log(chalk_1.default.blue("Locating Prisma Schema File"));
            const prismaSchema = yield readFileAsync(prismaSchemaPath, "utf-8");
            // Create the output Directory
            console.log(chalk_1.default.blue("Looking for output directory"));
            if (!fs_1.default.existsSync(outputDirectory)) {
                fs_1.default.mkdirSync(outputDirectory);
            }
            // Main section to build the app from the modelTree
            console.log(chalk_1.default.blue("Reading Prisma Schema"));
            const dmmf = yield (0, internals_1.getDMMF)({ datamodel: prismaSchema });
            console.log(chalk_1.default.blue("Creating Tree"));
            const modelTree = (0, modelTree_1.createModelTree)(dmmf.datamodel);
            const enums = getEnums(dmmf.datamodel);
            console.log(chalk_1.default.blue("Generating App Directory"));
            const routes = yield generateAppDirectoryFromModelTree(modelTree, outputDirectory, enums);
            // prettyPrintAPIRoutes(routes);
            console.log(chalk_1.default.blue("Generating Route List"));
            const routeList = generateRouteList(routes);
            // Copy over the files in the root dir
            addStringBetweenComments(path_1.default.join(__dirname, "templateApp"), routeList, "{/* @nexquik routeList start */}", "{/* @nexquik routeList stop */}");
            console.log(chalk_1.default.blue("Finishing Up"));
            const rootPageName = "page.tsx";
            (0, helpers_1.copyFileToDirectory)(path_1.default.join(__dirname, "templateApp", rootPageName), outputDirectory);
            const globalStylesFileName = "globals.css";
            (0, helpers_1.copyFileToDirectory)(path_1.default.join(__dirname, "templateApp", globalStylesFileName), outputDirectory);
            const rootLayoutFileName = "layout.tsx";
            (0, helpers_1.copyFileToDirectory)(path_1.default.join(__dirname, "templateApp", rootLayoutFileName), outputDirectory);
        }
        catch (error) {
            console.error("Error occurred:", error);
        }
    });
}
exports.generate = generate;
function generateShowForm(modelTree, routeUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueField = modelTree.model.fields.find((tableField) => tableField.isId);
        const uniqueFieldInputType = ((uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.type) && exports.prismaFieldToInputType[uniqueField.type]) || "text";
        // Define the React component template as a string
        const reactComponentTemplate = `
    <input hidden type="${uniqueFieldInputType}" name="${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}" defaultValue={nexquikTemplateModel?.${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}} />
    <form>
    <div className="button-group">


    <Link className="action-link edit-link" href={\`${routeUrl}/\${nexquikTemplateModel.${uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name}}/edit\`}>Edit</Link>

  
    <button className="action-link delete-link" formAction={deleteNexquikTemplateModel}>Delete</button>
    </div>

    <div className="container">

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
    });
}
exports.generateShowForm = generateShowForm;
function generateRouteList(routes) {
    const routeLinks = [];
    for (const route of routes) {
        routeLinks.push(`<tr className="item-row">
      <td>${route.segment}</td>
      <td>${route.operation} ${route.model}</td>
      <td>${route.description}</td>
      </tr>`);
    }
    return `<table className="item-list">  <tbody><tr className="header-row">

  <th>Route</th>
  <th>Operation</th>
  <th>Description</th>
</tr>${routeLinks.join("\n")}           </tbody> </table>
  `;
}
function generateAppDirectoryFromModelTree(modelTreeArray, outputDirectory, enums) {
    return __awaiter(this, void 0, void 0, function* () {
        const routes = [];
        function generateRoutes(modelTree, parentRoute) {
            var _a, _b, _c, _d, _e, _f;
            return __awaiter(this, void 0, void 0, function* () {
                const modelName = modelTree.modelName;
                const modelUniqueIdentifierField = modelTree.uniqueIdentifierField;
                const route = parentRoute.name +
                    (parentRoute.name === "/"
                        ? ""
                        : `/[${(0, helpers_1.getDynamicSlug)((_a = modelTree.parent) === null || _a === void 0 ? void 0 : _a.name, parentRoute.uniqueIdentifierField)}]/`) +
                    modelName.charAt(0).toLowerCase() +
                    modelName.slice(1);
                const directoryToCreate = path_1.default.join(outputDirectory, route);
                if (!fs_1.default.existsSync(directoryToCreate)) {
                    fs_1.default.mkdirSync(directoryToCreate);
                }
                const uniqueDynamicSlug = (0, helpers_1.getDynamicSlug)(modelTree.modelName, modelUniqueIdentifierField === null || modelUniqueIdentifierField === void 0 ? void 0 : modelUniqueIdentifierField.name);
                (0, helpers_1.copyDirectory)(path_1.default.join(__dirname, "templateApp", "nexquikTemplateModel"), directoryToCreate, true);
                fs_1.default.renameSync(path_1.default.join(directoryToCreate, "[id]"), path_1.default.join(directoryToCreate, `[${uniqueDynamicSlug}]`));
                // ############### List Page
                const listFormCode = yield generateListForm2(modelTree, (0, helpers_1.convertRouteToRedirectUrl)(route));
                addStringBetweenComments(directoryToCreate, listFormCode, "{/* @nexquik listForm start */}", "{/* @nexquik listForm stop */}");
                const deleteWhereClause = generateDeleteClause((_b = modelTree.uniqueIdentifierField) === null || _b === void 0 ? void 0 : _b.name, (_c = modelTree.uniqueIdentifierField) === null || _c === void 0 ? void 0 : _c.type);
                addStringBetweenComments(directoryToCreate, deleteWhereClause, "//@nexquik prismaDeleteClause start", "//@nexquik prismaDeleteClause stop");
                const listRedirect = yield generateRedirect(`\`${(0, helpers_1.convertRouteToRedirectUrl)(route)}\``);
                addStringBetweenComments(directoryToCreate, listRedirect, "//@nexquik listRedirect start", "//@nexquik listRedirect stop");
                const parentIdentifierField = modelTree.model.fields.find((field) => field.isId);
                const whereparentClause = modelTree.parent
                    ? generateWhereParentClause("params", (0, helpers_1.getDynamicSlug)(modelTree.parent.name, parentIdentifierField === null || parentIdentifierField === void 0 ? void 0 : parentIdentifierField.name), parentIdentifierField === null || parentIdentifierField === void 0 ? void 0 : parentIdentifierField.name, parentIdentifierField === null || parentIdentifierField === void 0 ? void 0 : parentIdentifierField.type, (0, modelTree_1.getParentReferenceField)(modelTree))
                    : "()";
                addStringBetweenComments(directoryToCreate, whereparentClause, "//@nexquik prismaWhereParentClause start", "//@nexquik prismaWhereParentClause stop");
                // ############### Show Page
                const showFormCode = yield generateShowForm(modelTree, (0, helpers_1.convertRouteToRedirectUrl)(route));
                addStringBetweenComments(directoryToCreate, showFormCode, "{/* @nexquik showForm start */}", "{/* @nexquik showForm stop */}");
                const childModelLinkList = yield generateChildrenList(modelTree, (0, helpers_1.convertRouteToRedirectUrl)(route));
                addStringBetweenComments(directoryToCreate, childModelLinkList, "{/* @nexquik listChildren start */}", "{/* @nexquik listChildren stop */}");
                // ############### Create Page
                const createFormCode = yield generateCreateForm(modelTree, (0, helpers_1.convertRouteToRedirectUrl)(route), enums);
                addStringBetweenComments(directoryToCreate, createFormCode, "{/* @nexquik createForm start */}", "{/* @nexquik createForm stop */}");
                const createRedirect = yield generateRedirect(`\`${(0, helpers_1.convertRouteToRedirectUrl)(route)}/\${created.${(_d = modelTree.uniqueIdentifierField) === null || _d === void 0 ? void 0 : _d.name}}\``);
                addStringBetweenComments(directoryToCreate, createRedirect, "//@nexquik createRedirect start", "//@nexquik createRedirect stop");
                const createLink = yield generateLink(`${(0, helpers_1.convertRouteToRedirectUrl)(route)}/create`, "Create New NexquikTemplateModel");
                addStringBetweenComments(directoryToCreate, createLink, "{/* @nexquik createLink start */}", "{/* @nexquik createLink stop */}");
                const prismaInput = generateConvertToPrismaInputCode(modelTree);
                addStringBetweenComments(directoryToCreate, prismaInput, "//@nexquik prismaDataInput start", "//@nexquik prismaDataInput stop");
                const identifierField = modelTree.model.fields.find((field) => field.isId);
                const whereClause = generateWhereClause("params", uniqueDynamicSlug, identifierField === null || identifierField === void 0 ? void 0 : identifierField.type, identifierField === null || identifierField === void 0 ? void 0 : identifierField.name);
                addStringBetweenComments(directoryToCreate, whereClause, "//@nexquik prismaWhereInput start", "//@nexquik prismaWhereInput stop");
                // ############### Edit Page
                const editFormCode = yield generateEditForm(modelTree, (0, helpers_1.convertRouteToRedirectUrl)(route), enums);
                addStringBetweenComments(directoryToCreate, editFormCode, "{/* @nexquik editForm start */}", "{/* @nexquik editForm stop */}");
                const editRedirect = yield generateRedirect(`\`${(0, helpers_1.convertRouteToRedirectUrl)(route)}/\${params.${uniqueDynamicSlug}}\``);
                addStringBetweenComments(directoryToCreate, editRedirect, "//@nexquik editRedirect start", "//@nexquik editRedirect stop");
                // ############### Extras
                const revalidatePath = yield generateRevalidatePath(`${(0, helpers_1.convertRouteToRedirectUrl)(route)}`);
                addStringBetweenComments(directoryToCreate, revalidatePath, "//@nexquik revalidatePath start", "//@nexquik revalidatePath stop");
                const backLink = yield generateLink((0, helpers_1.popStringEnd)(`${(0, helpers_1.convertRouteToRedirectUrl)(route)}`, "/"), "Back");
                addStringBetweenComments(directoryToCreate, backLink, "{/* @nexquik backLink start */}", "{/* @nexquik backLink stop */}");
                const backToCurrent = yield generateLink(`${(0, helpers_1.convertRouteToRedirectUrl)(route)}`, "Back");
                addStringBetweenComments(directoryToCreate, backToCurrent, "{/* @nexquik backToCurrentLink start */}", "{/* @nexquik backToCurrentLink stop */}");
                // Replace all placeholder model names
                (0, helpers_1.findAndReplaceInFiles)(directoryToCreate, "nexquikTemplateModel", modelTree.modelName);
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
                    segment: `${route}/[${(0, helpers_1.getDynamicSlug)(modelName, (_e = modelTree.uniqueIdentifierField) === null || _e === void 0 ? void 0 : _e.name)}]/edit`,
                    model: modelName,
                    operation: "Edit",
                    description: `Edit a ${modelName} by ID`,
                });
                // Show
                routes.push({
                    segment: `${route}/[${(0, helpers_1.getDynamicSlug)(modelName, (_f = modelTree.uniqueIdentifierField) === null || _f === void 0 ? void 0 : _f.name)}]`,
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
                    yield generateRoutes(child, {
                        name: route,
                        uniqueIdentifierField: modelUniqueIdentifierField === null || modelUniqueIdentifierField === void 0 ? void 0 : modelUniqueIdentifierField.name,
                    });
                }
            });
        }
        for (const modelTree of modelTreeArray) {
            yield generateRoutes(modelTree, {
                name: "/",
                uniqueIdentifierField: "",
            });
        }
        return routes;
    });
}
exports.generateAppDirectoryFromModelTree = generateAppDirectoryFromModelTree;
function generateConvertToPrismaInputCode(modelTree) {
    var _a, _b;
    // If model has a parent, get the parent accessor
    let relationFieldToParent = "";
    let fieldType = "";
    if (modelTree.parent) {
        // Get the field on the current model that is the id referencing the parent
        modelTree.model.fields.forEach((mf) => {
            var _a, _b;
            if (mf.type === ((_a = modelTree.parent) === null || _a === void 0 ? void 0 : _a.name)) {
                if (((_b = mf.relationFromFields) === null || _b === void 0 ? void 0 : _b.length) && mf.relationFromFields.length > 0) {
                    relationFieldToParent = mf.relationFromFields[0];
                }
            }
        });
        // Get the field type on the current model that is the id referencing the parent
        fieldType =
            ((_a = modelTree.model.fields.find((f) => f.name === relationFieldToParent)) === null || _a === void 0 ? void 0 : _a.type) || "";
    }
    const fieldsToConvert = modelTree.model.fields
        .filter(({ isId }) => !isId)
        .filter((field) => isFieldRenderable(field));
    const convertToPrismaInputLines = fieldsToConvert.map(({ name, type }) => {
        let typecastValue = `formData.get('${name}')`;
        if (type === "Int" || type === "Float") {
            typecastValue = `Number(${typecastValue})`;
        }
        else if (type === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
        }
        else if (type === "DateTime") {
            typecastValue = `new Date(String(${typecastValue}))`;
        }
        else {
            typecastValue = `String(${typecastValue})`;
        }
        return `    ${name}: ${typecastValue},`;
    });
    // Convert the parent accessor  differently
    if (relationFieldToParent && fieldType) {
        // Get the parent unique slug
        const parentIdentifierField = modelTree.model.fields.find((field) => field.isId);
        const parentSlug = (0, helpers_1.getDynamicSlug)((_b = modelTree.parent) === null || _b === void 0 ? void 0 : _b.name, parentIdentifierField === null || parentIdentifierField === void 0 ? void 0 : parentIdentifierField.name);
        let typecastValue = `params.${parentSlug}`;
        if (fieldType === "Int" || fieldType === "Float") {
            typecastValue = `Number(${typecastValue})`;
        }
        else if (fieldType === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
        }
        else if (fieldType === "DateTime") {
            typecastValue = `new Date(String(${typecastValue}))`;
        }
        else {
            typecastValue = `String(${typecastValue})`;
        }
        convertToPrismaInputLines.push(`    ${relationFieldToParent}: ${typecastValue},`);
    }
    // Convert fields pointing to other relations differently
    modelTree.model.fields.map((field) => {
        var _a, _b;
        if (field.kind === "object") {
            const relationFrom = field.relationFromFields && field.relationFromFields[0];
            const referencedModelName = field.type;
            if (referencedModelName === ((_a = modelTree.parent) === null || _a === void 0 ? void 0 : _a.name)) {
            }
            else if (relationFrom) {
                const fieldType2 = (_b = modelTree.model.fields.find((f) => f.name === relationFrom)) === null || _b === void 0 ? void 0 : _b.type;
                let typecastValue = `formData.get('${relationFrom}')`;
                if (fieldType2 === "Int" || fieldType2 === "Float") {
                    typecastValue = `Number(${typecastValue})`;
                }
                else if (fieldType2 === "Boolean") {
                    typecastValue = `Boolean(${typecastValue})`;
                }
                else if (fieldType2 === "DateTime") {
                    typecastValue = `new Date(String(${typecastValue}))`;
                }
                else {
                    typecastValue = `String(${typecastValue})`;
                }
                convertToPrismaInputLines.push(`    ${relationFrom}: ${typecastValue},`);
            }
        }
    });
    return `{
  ${convertToPrismaInputLines.join("\n")}
    }`;
}
exports.generateConvertToPrismaInputCode = generateConvertToPrismaInputCode;
function generateWhereParentClause(inputObject, fieldAccessValue, parentIdentifierFieldName, parentIdentifierFieldType, parentReferenceField) {
    if (inputObject &&
        fieldAccessValue &&
        parentIdentifierFieldName &&
        parentIdentifierFieldType &&
        parentReferenceField) {
        let typecastValue = `${inputObject}.${fieldAccessValue}`;
        if (parentIdentifierFieldType === "Int" ||
            parentIdentifierFieldType === "Float") {
            typecastValue = `Number(${typecastValue})`;
        }
        else if (parentIdentifierFieldType === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
        }
        return `({ where: { ${parentReferenceField}: {${parentIdentifierFieldName}: {equals: ${typecastValue}} } } })`;
    }
    else {
        return "";
    }
}
exports.generateWhereParentClause = generateWhereParentClause;
function generateWhereClause(inputObject, identifierFieldName, identifierFieldType, modelUniqueIdField) {
    if (inputObject &&
        identifierFieldName &&
        identifierFieldType &&
        modelUniqueIdField) {
        let typecastValue = `${inputObject}.${identifierFieldName}`;
        if (identifierFieldType === "Int" || identifierFieldType === "Float") {
            typecastValue = `Number(${typecastValue})`;
        }
        else if (identifierFieldType === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
        }
        return `{ ${modelUniqueIdField}: ${typecastValue} },`;
    }
    else {
        return "";
    }
}
exports.generateWhereClause = generateWhereClause;
function generateDeleteClause(identifierFieldName, identifierFieldType) {
    if (identifierFieldName && identifierFieldType) {
        let typecastValue = `formData.get('${identifierFieldName}')`;
        if (identifierFieldType === "Int" || identifierFieldType === "Float") {
            typecastValue = `Number(${typecastValue})`;
        }
        else if (identifierFieldType === "Boolean") {
            typecastValue = `Boolean(${typecastValue})`;
        }
        return `{ ${identifierFieldName}: ${typecastValue} },`;
    }
    else {
        return "";
    }
}
exports.generateDeleteClause = generateDeleteClause;
// Custom export function to check if field is renderable in a form
function isFieldRenderable(field) {
    return !(field.isReadOnly || field.isList || !!field.relationName);
}
exports.isFieldRenderable = isFieldRenderable;
function generateFormFields(modelTree, enums) {
    return modelTree.model.fields
        .map((field) => {
        var _a, _b;
        // Enum
        if (field.kind === "enum") {
            const enumValues = enums[field.type];
            return `<label>${field.name}</label>\n

        <select name="${field.name}" id="${field.name}">
        ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
</select>`;
        }
        const inputType = exports.prismaFieldToInputType[field.type] || "text";
        const required = field.isRequired ? "required" : "";
        if (field.kind === "object") {
            const relationFrom = field.relationFromFields && field.relationFromFields[0];
            const referencedModelName = field.type;
            if (referencedModelName === ((_a = modelTree.parent) === null || _a === void 0 ? void 0 : _a.name)) {
            }
            else if (relationFrom) {
                const fieldType2 = (_b = modelTree.model.fields.find((f) => f.name === relationFrom)) === null || _b === void 0 ? void 0 : _b.type;
                if (fieldType2) {
                    const inputType2 = exports.prismaFieldToInputType[fieldType2] || "text";
                    return `<label>${relationFrom}</label>\n
            <input type="${inputType2}" name="${relationFrom}" ${required}/>`;
                }
                else {
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
exports.generateFormFields = generateFormFields;
function generateFormFieldsWithDefaults(tableFields, enums) {
    return tableFields
        .map((field) => {
        if (!isFieldRenderable(field)) {
            return "";
        }
        // Enum
        if (field.kind === "enum") {
            const enumValues = enums[field.type];
            return `<label>${field.name}</label>\n
              <select name="${field.name}" id="${field.name}" defaultValue={nexquikTemplateModel.${field.name}}>
              ${enumValues.map((v) => `<option value="${v}">${v}</option>`)}
      </select>`;
        }
        const inputType = exports.prismaFieldToInputType[field.type] || "text";
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
exports.generateFormFieldsWithDefaults = generateFormFieldsWithDefaults;
//# sourceMappingURL=generators.js.map