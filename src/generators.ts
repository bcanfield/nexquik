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
  copyImage,
  copyPublicDirectory,
  getDynamicSlugs,
  modifyFile,
} from "./helpers";
import {
  ModelTree,
  createModelTree,
  getParentReferenceField,
} from "./modelTree";

const blueButtonClass =
  "px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-sky-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-sky-600 dark:focus:ring-blue-500 dark:focus:text-white";
const grayButtonClass =
  "px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white";

const blueTextClass =
  "dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-600";

const labelClass = "block text-slate-500 dark:text-slate-400 text-sm";
const inputClass =
  "accent-sky-700 block text-sm leading-6  rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700";
const disabledInputClass =
  "block leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3  dark:bg-slate-800 ";
const darkTextClass = "text-slate-700 dark:text-slate-400";
const lightTextClass = "text-slate-900 dark:text-slate-200";
const readFileAsync = promisify(fs.readFile);

interface RouteSegment {
  segment: string;
  fullRoute: string;
}

function splitTheRoute(route: string): RouteSegment[] {
  const segments = route.split("/").filter((r) => r != "");
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
}
function generateBreadCrumb(route: string) {
  let routeCrumbs = "";
  splitTheRoute(route).forEach(({ segment, fullRoute }) => {
    routeCrumbs += `
      
       <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <Link href={\`${fullRoute}\`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">${segment}</Link>
          </div>
        </li>`;
  });
  const breadCrumb = `
    <nav className="flex" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
    <li className="inline-flex items-center">
    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
      <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
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

async function generateCreateForm(
  modelTree: ModelTree,
  routeUrl: string,
  enums: Record<string, string[]>
): Promise<string> {
  const formFields = generateFormFields(modelTree, enums);
  const reactComponentTemplate = `
      <form className="space-y-2" action={addNexquikTemplateModel}>
        ${formFields}
        <div className="flex space-x-4  pt-4">
        <button type="submit"                   className="${blueButtonClass}"
        >
            Create NexquikTemplateModel
        </button>
       
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


  <Link href={${linkString}} className="inline-flex items-center ${blueButtonClass}">
  <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.546.5a9.5 9.5 0 1 0 9.5 9.5 9.51 9.51 0 0 0-9.5-9.5ZM13.788 11h-3.242v3.242a1 1 0 1 1-2 0V11H5.304a1 1 0 0 1 0-2h3.242V5.758a1 1 0 0 1 2 0V9h3.242a1 1 0 1 1 0 2Z"/>
    </svg>
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
  const formFields = generateFormFieldsWithDefaults(
    modelTree.model.fields,
    enums
  );
  // Define the React component template as a string
  const reactComponentTemplate = `
  <form className="space-y-2" action={editNexquikTemplateModel}>
  ${formFields}
  <div className="flex space-x-4  pt-4">
        <button  className="${blueButtonClass}" type="submit">Update NexquikTemplateModel</button>
        <Link href={\`${routeUrl}\`} className="${grayButtonClass}" passHref>
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

  const childList = `  <table className="w-full text-left border-collapse mt-4">

  <thead>

  <tr>
  <th className="sticky z-10 top-0 text-sm leading-6 font-semibold  bg-white p-0 dark:bg-slate-900 ${darkTextClass}"> <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Children</div> </th>
  </tr>
  </thead>

  <tbody className="align-baseline">

  `;
  modelTree.children.forEach((c) => {
    let childLink = `
    
    <tr key={'${c.modelName}'}>
    <td  translate="no"
            className="py-2 pr-2 leading-6 ">
    <Link
      className="${grayButtonClass}"
      href={\`${routeUrl}/`;

    slug.forEach((s) => {
      childLink += `\${params.${s}}/`;
    });

    childLink += `${
      c.modelName.charAt(0).toLowerCase() + c.modelName.slice(1)
    }\`}  >
    ${c.modelName}
  </Link>
  </td>
</tr>`;
    childrenLinks.push(childLink);
  });
  return childList + childrenLinks.join("\n") + "</tbody></table>";
}
async function generateListForm(
  modelTree: ModelTree,
  routeUrl: string,
  uniqueFields: {
    name: string;
    type: string;
  }[],
  idFields: string[]
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
  <table className="w-full text-left border-collapse mt-2 border-b border-slate-200 dark:border-slate-400/20">
  <thead>

  <tr>
  ${idFields
    .map((field) => {
      return `<th className="sticky z-10 top-0 text-sm leading-6 font-semibold  bg-white dark:bg-slate-900 p-0 ${darkTextClass}"> <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">${field} </div> </th>`;
    })
    .join("\n")}
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold bg-white p-0 dark:bg-slate-900 ${darkTextClass}"> <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Actions </div> </th>
  </tr>
  </thead>
  <tbody className="align-baseline">

    {nexquikTemplateModel?.map((nexquikTemplateModel, index) => (
      <tr key={index}>
      
      ${idFields
        .map((field) => {
          return `<td  translate="no"
            className="py-2 pr-2  font-bold text-sm leading-6 whitespace-nowrap ${lightTextClass}"> {\`\${nexquikTemplateModel.${field}}\`} </td>`;
        })
        .join("\n")}

      <td className="py-2 pr-2 font-bold text-sm leading-6 text-sky-500 whitespace-nowrap ${lightTextClass}">
      <form className="flex space-x-2">
      ${uniqueFormInputs}



      <div className="inline-flex rounded-md shadow-sm" role="group">

  <Link href={\`${linkHref}\`} className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
  <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
  <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
    </svg>
    View
  </Link>


  <Link href={\`${linkHref}/edit\`}  className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
  <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.835 7.578-.005.007-7.137 7.137 2.139 2.138 7.143-7.142-2.14-2.14Zm-10.696 3.59 2.139 2.14 7.138-7.137.007-.005-2.141-2.141-7.143 7.143Zm1.433 4.261L2 12.852.051 18.684a1 1 0 0 0 1.265 1.264L7.147 18l-2.575-2.571Zm14.249-14.25a4.03 4.03 0 0 0-5.693 0L11.7 2.611 17.389 8.3l1.432-1.432a4.029 4.029 0 0 0 0-5.689Z"/>

    </svg>
  Edit
</Link>

  
  <button formAction={deleteNexquikTemplateModel}  className="inline-flex items-center px-2 py-1  text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-red-900 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-red-800 dark:focus:ring-blue-500 dark:focus:text-white">
    <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"/>

    </svg>
    Delete
  </button>
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
  excludedModels: string[],
  includedModels: string[],
  maxAllowedDepth: number
) {
  // Read the Prisma schema file
  const prismaSchema = await readFileAsync(prismaSchemaPath, "utf-8");

  // Create the output directory
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true });
  }
  fs.mkdirSync(outputDirectory);

  // Create the app directory
  const appDirectory = path.join(outputDirectory, "app");
  fs.mkdirSync(appDirectory);

  // Main section to build the app from the modelTree
  const dmmf = await getDMMF({ datamodel: prismaSchema });

  // Create model tree and verify there is at least one valid model
  const modelTree = createModelTree(
    dmmf.datamodel,
    excludedModels,
    includedModels
  );
  if (modelTree.length === 0) {
    console.log(chalk.red("No valid models detected in schema"));
    throw new Error("No valid models detected in schema");
  }

  // Copy all files from the root dir except for app. (package.json, next.config, etc)
  copyDirectory(
    path.join(__dirname, "templateRoot"),
    outputDirectory,
    true,
    "app"
  );

  // Try copying over public folder
  copyPublicDirectory(
    path.join(__dirname, "templateRoot", "public"),
    path.join(outputDirectory, "public"),
    true,
    "app"
  );

  // copy over images
  copyImage(
    path.join(__dirname, "templateRoot", "app"),
    "favicon.ico",
    path.join(outputDirectory, "app")
  );
  copyImage(
    path.join(__dirname, "templateRoot", "app"),
    "icon.png",
    path.join(outputDirectory, "app")
  );

  fs.mkdirSync(path.join(outputDirectory, "prisma"));

  // Copy over the user's prisma schema and rename it to schema.prisma
  copyAndRenameFile(
    prismaSchemaPath,
    path.join(outputDirectory, "prisma"),
    "schema.prisma"
  );

  const enums = getEnums(dmmf.datamodel);

  console.log(
    `${chalk.blue.bold(
      "Generating directories for your models..."
    )} ${chalk.gray("(For deeply-nested schemas, this may take a moment)")}`
  );

  await generateAppDirectoryFromModelTree(
    modelTree,
    appDirectory,
    enums,
    maxAllowedDepth
  );

  // Home route list
  const modelNames = modelTree.map((m) => m.model.name);

  const routeList = generateRouteList(modelTree.map((m) => m.model.name));

  // dynamic/edit/page.tsx
  modifyFile(
    path.join(appDirectory, "page.tsx"),
    path.join(path.join(outputDirectory, "app", "page.tsx")),
    [
      {
        startComment: "{/* @nexquik routeList start */}",
        endComment: "{/* @nexquik routeList stop */}",
        insertString: routeList,
      },
    ]
  );

  // Route sidebar
  let routeSidebar = "";
  for (const model of modelNames) {
    const lowerCase = model.charAt(0).toLowerCase() + model.slice(1);
    routeSidebar += `<li className="mt-4">

                      <a
                      href="/${lowerCase}"
                      className="pl-2 mb-8 lg:mb-1 font-semibold dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-600"
                    >
                    ${model}
                    </a>


                    

</li>

`;
  }

  // layout.tsx
  await modifyFile(
    path.join(path.join(__dirname, "templateRoot", "app", "layout.tsx")),
    path.join(path.join(outputDirectory, "app", "layout.tsx")),
    [
      {
        startComment: "{/* //@nexquik routeSidebar start */}",
        endComment: "{/* //@nexquik routeSidebar stop */}",
        insertString: routeSidebar,
      },
    ]
  );

  return;
}

export async function generateShowForm(
  modelTree: ModelTree,
  routeUrl: string,
  childModelLinkList: string
): Promise<string> {
  const uniqueFields = modelTree.uniqueIdentifierField;

  let linkRoute = routeUrl;
  uniqueFields.forEach((f) => {
    linkRoute += `/\${nexquikTemplateModel?.${f?.name}}`;
  });
  const reactComponentTemplate = `
  
    <form className="space-y-2">
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


  
     

  <table className="w-full text-left border-collapse">
<thead>
  <tr>
  
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold  bg-white p-0 dark:bg-slate-900 ${darkTextClass}"> <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Field </div> </th>
        <th className="sticky z-10 top-0 text-sm leading-6 font-semibold bg-white p-0 dark:bg-slate-900 ${darkTextClass}"> <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Value </div> </th>

  </tr>
  </thead>



    <tbody className="align-baseline">

    ${modelTree.model.fields
      .map((field) => {
        if (!isFieldRenderable(field)) {
          return "";
        }
        return `
        
              <tr key={'${field.name}'}>
<td  translate="no"
            className="py-2 pr-2  font-bold text-sm leading-6 whitespace-nowrap ${lightTextClass}"> ${field.name} </td>
<td  translate="no"
            className="py-2 pr-2 font-medium text-sm leading-6 text-slate-700 whitespace-nowrap dark:text-slate-400"> {\`\${nexquikTemplateModel?.${field.name}}\`} </td>


              </tr>  
  
  
  
  
  `;
      })
      .join("\n")}


        </tbody>






    
    </table>
    

    <div className="inline-flex rounded-md shadow-sm" role="group">

    <Link href={\`${linkRoute}/edit\`} className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
    <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.835 7.578-.005.007-7.137 7.137 2.139 2.138 7.143-7.142-2.14-2.14Zm-10.696 3.59 2.139 2.14 7.138-7.137.007-.005-2.141-2.141-7.143 7.143Zm1.433 4.261L2 12.852.051 18.684a1 1 0 0 0 1.265 1.264L7.147 18l-2.575-2.571Zm14.249-14.25a4.03 4.03 0 0 0-5.693 0L11.7 2.611 17.389 8.3l1.432-1.432a4.029 4.029 0 0 0 0-5.689Z"/>

    </svg>
  Edit
    </Link>
  
  
    
    <button formAction={deleteNexquikTemplateModel}  className="inline-flex items-center px-2 py-1  text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-red-900 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-red-800 dark:focus:ring-blue-500 dark:focus:text-white">
      <svg className="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"/>
  
      </svg>
      Delete
    </button>
  </div>


    </form>
    ${childModelLinkList}

  `;

  return reactComponentTemplate;
}

function generateRouteList(modelNames: string[]) {
  const routeLinks = [];
  for (const model of modelNames) {
    const lowerCase = model.charAt(0).toLowerCase() + model.slice(1);
    routeLinks.push(`<tr>
    <td
      translate="no"
      className="py-2 pr-2 font-bold text-sm leading-6 whitespace-nowrap ${lightTextClass}"
    >
      ${model}
    </td>
    
    <td
      translate="no"
      className="py-2 pr-2 font-medium text-sm leading-6 whitespace-nowrap "
    >
    <a className="${blueTextClass}" href="/${lowerCase}/create">
      Create 
      </a>
      <a className="${darkTextClass}">
      {' '} / {' '}
      </a>
      <a className="${blueTextClass}" href="/${lowerCase}">
      List 
      </a>
    </td>
  
    </tr>
    `);
  }

  return `

  <table className="min-w-full text-left border-collapse  ">
  <thead>
  <tr>
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold  bg-white p-0 dark:bg-slate-900 ${darkTextClass}">
      <div className="py-2 border-b border-slate-200 dark:border-slate-400/20">
        Model
      </div>
    </th>
    <th className="sticky z-10 top-0 text-sm leading-6 font-semibold bg-white p-0 dark:bg-slate-900 sm:table-cell ${darkTextClass}">
      <div className="py-2 border-b border-slate-200 dark:border-slate-400/20 pr-2">
        Operations
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
  enums: Record<string, string[]>,
  maxAllowedDepth: number
): Promise<RouteObject[]> {
  const routes: RouteObject[] = [];
  let fileCount = 0;
  let directoryCount = 0;
  let maxDepth = 0;
  async function generateRoutes(
    modelTree: ModelTree,
    parentRoute: {
      name: string;
      uniqueIdentifierField: { name: string; type: string }[];
    },
    depth = 0,
    maxAllowedDepth: number
  ) {
    if (depth > maxAllowedDepth) {
      maxDepth = maxAllowedDepth;
      process.stdout.write(
        chalk.yellow(`\u001b[2K\rMax depth hit for ${modelTree.modelName}`)
      );
      return;
    }
    if (depth > maxDepth) {
      maxDepth = depth;
    }
    process.stdout.write(`\u001b[2K\r${modelTree.model.name} - Depth ${depth}`);

    let childLoopPromises: Promise<void>[] = [];
    directoryCount += 3;
    fileCount += 4;
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
      // Create create directory
      if (!fs.existsSync(path.join(baseModelDirectory, "create"))) {
        fs.mkdirSync(path.join(baseModelDirectory, "create"));
      }

      const templateModelDirectory = path.join(
        __dirname,
        "templateRoot",
        "app",
        "nexquikTemplateModel"
      );
      const createBreadCrumb = generateBreadCrumb(route + "/create");

      const listBreadCrumb = generateBreadCrumb(route);

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

      // Create edit directory
      if (!fs.existsSync(path.join(dynamicOutputDirectory, "edit"))) {
        fs.mkdirSync(path.join(dynamicOutputDirectory, "edit"));
      }

      const templateDynamicDirectory = path.join(
        __dirname,
        "templateRoot",
        "app",
        "nexquikTemplateModel",
        "[id]"
      );

      // ############### List Page
      const idFields = modelTree.uniqueIdentifierField;
      let select = "";
      if (idFields.length > 0) {
        select += "select:{";
        idFields.forEach(({ name }, index) => {
          if (index > 0) {
            select += ",";
          }
          select += `${name}: true`;
        });
        select += "}, ";
      }
      select += ` skip: page,
take: limit`;
      const listFormCode = await generateListForm(
        modelTree,
        createRedirectForm,
        modelUniqueIdentifierField,
        idFields.map((f) => f.name)
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
      const deleteWhereClause = generateDeleteClause(
        modelUniqueIdentifierField
      );

      const listRedirect = await generateRedirect(`\`${createRedirectForm}\``);

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
            manyToManyWhere,
            select
          )
        : `({${select}})`;
      // Enum import for create and edit pages
      const enumImport = Object.keys(enums)
        .map((e) => `import { ${e} } from "@prisma/client";`)
        .join("\n");

      const linkHref = createRedirectForm;

      const listPagination = `

      <ul className="flex items-center -space-x-px h-8 text-sm mt-4">
      <li>
        <Link
          href={{
            pathname: \`${linkHref}\`,
            query: {
              page: page != 1 ? page - 1 : 1,
            },
          }}
          className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span className="sr-only">Previous</span>
          <svg
            className="w-2.5 h-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
        </Link>
      </li>
      {Array(Math.ceil(count / limit))
        .fill(0)
        .map((_, i) => (
          <li>
            <Link
              href={{
                pathname: \`${linkHref}\`,
                query: {
                  page: i + 1,
                },
              }}
              className={clsx(
                "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
                page === i + 1 && "pointer-events-none opacity-50"
              )}
            >
              {i + 1}
            </Link>
          </li>
        ))}
      <li>
        <Link
          href={{
            pathname: \`${linkHref}\`,
            query: {
              page: page >= Math.ceil(count / limit) ? page : page + 1,
            },
          }}
          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span className="sr-only">Next</span>
          <svg
            className="w-2.5 h-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
        </Link>
      </li>
    </ul>
    
    
    `;

      const countWhereparentClause = modelTree.parent
        ? generateWhereParentClause(
            "params",
            getDynamicSlugs(modelTree.parent.name, [parentIdentifierField])[0],
            relationsToParent ? relationsToParent[0] : parentIdentifierField,
            parentReferenceFieldType || fieldType,
            getParentReferenceField(modelTree),
            manyToManyWhere,
            ""
          )
        : ``;
      const listCount = `
    const page =
    typeof searchParams?.page === "string" ? Number(searchParams?.page) : 1;
  const limit =
    typeof searchParams?.limit === "string" ? Number(searchParams?.limit) : 10;
  const count = await prisma.${
    modelName.charAt(0).toLowerCase() + modelName.slice(1)
  }.count${countWhereparentClause ? countWhereparentClause : "()"};
    `;

      const uniqueDynamicSlugs = getDynamicSlugs(
        modelTree.modelName,
        modelUniqueIdentifierField.map((f) => f.name)
      );

      // ############### Show Page
      const childModelLinkList = await generateChildrenList(
        modelTree,
        createRedirectForm
      );
      const showFormCode = await generateShowForm(
        modelTree,
        createRedirectForm,
        childModelLinkList
      );

      // If many to many, must do a connect
      const createFormCode = await generateCreateForm(
        modelTree,
        createRedirectForm,
        enums
      );

      let redirectStr = "";
      modelTree.uniqueIdentifierField.forEach(
        (f) => (redirectStr += "/" + `\${created.${f.name}}`)
      );
      const createRedirect = await generateRedirect(
        `\`${createRedirectForm}${redirectStr}\``
      );

      const createLink = await generateLink(
        `${createRedirectForm}/create`,
        "Create New NexquikTemplateModel"
      );

      const prismaInput = generateConvertToPrismaInputCode(modelTree);

      const parentSlugs = getDynamicSlugs(
        modelTree.parent?.name,
        parentRoute.uniqueIdentifierField.map((f) => f.name)
      );

      const prismaCreateInput = generateConvertToPrismaCreateInputCode(
        modelTree,
        parentSlugs,
        manyToManyConnect
      );

      const whereClause = generateWhereClause(
        "params",
        uniqueDynamicSlugs,
        modelUniqueIdentifierField
      );

      // ############### Edit Page
      const editFormCode = await generateEditForm(
        modelTree,
        createRedirectForm,
        enums
      );

      let redirectStr2 = "";
      uniqueDynamicSlugs.forEach(
        (f) => (redirectStr2 += "/" + `\${params.${f}}`)
      );

      const editRedirect = await generateRedirect(
        `\`${createRedirectForm}/${redirectStr2}\``
      );

      // ############### Extras
      const revalidatePath = await generateRevalidatePath(
        `${createRedirectForm}`
      );

      const baseBreadCrumb = generateBreadCrumb(route);

      const editBreadCrumb = generateBreadCrumb(route + "/edit");

      // dynamic/edit/page.tsx
      childLoopPromises.push(
        modifyFile(
          path.join(templateDynamicDirectory, "edit", "page.tsx"),
          path.join(dynamicOutputDirectory, "edit", "page.tsx"),
          [
            {
              startComment: "//@nexquik prismaEnumImport start",
              endComment: "//@nexquik prismaEnumImport stop",
              insertString: enumImport,
            },
            {
              startComment: "//@nexquik prismaWhereInput start",
              endComment: "//@nexquik prismaWhereInput stop",
              insertString: whereClause,
            },
            {
              startComment: "//@nexquik prismaEditDataInput start",
              endComment: "//@nexquik prismaEditDataInput stop",
              insertString: prismaInput,
            },
            {
              startComment: "//@nexquik editRedirect start",
              endComment: "//@nexquik editRedirect stop",
              insertString: editRedirect,
            },
            {
              startComment: "{/* @nexquik editBreadCrumb start */}",
              endComment: "{/* @nexquik editBreadCrumb stop */}",
              insertString: editBreadCrumb,
            },
            {
              startComment: "{/* @nexquik editForm start */}",
              endComment: "{/* @nexquik editForm stop */}",
              insertString: editFormCode,
            },
          ],
          modelTree.modelName
        )
      );

      // dynamic/page.tsx
      childLoopPromises.push(
        modifyFile(
          path.join(templateDynamicDirectory, "page.tsx"),
          path.join(dynamicOutputDirectory, "page.tsx"),
          [
            {
              startComment: "//@nexquik prismaWhereInput start",
              endComment: "//@nexquik prismaWhereInput stop",
              insertString: whereClause,
            },
            {
              startComment: "//@nexquik prismaDeleteClause start",
              endComment: "//@nexquik prismaDeleteClause stop",
              insertString: deleteWhereClause,
            },
            {
              startComment: "//@nexquik revalidatePath start",
              endComment: "//@nexquik revalidatePath stop",
              insertString: revalidatePath,
            },
            {
              startComment: "//@nexquik listRedirect start",
              endComment: "//@nexquik listRedirect stop",
              insertString: listRedirect,
            },
            {
              startComment: "{/* @nexquik breadcrumb start */}",
              endComment: "{/* @nexquik breadcrumb stop */}",
              insertString: baseBreadCrumb,
            },
            {
              startComment: "{/* @nexquik showForm start */}",
              endComment: "{/* @nexquik showForm stop */}",
              insertString: showFormCode,
            },
          ],
          modelTree.modelName
        )
      );

      // base/page.tsx
      childLoopPromises.push(
        modifyFile(
          path.join(templateModelDirectory, "page.tsx"),
          path.join(baseModelDirectory, "page.tsx"),
          [
            {
              startComment: "/* @nexquik listCount start */",
              endComment: "/* @nexquik listCount stop */",
              insertString: listCount,
            },
            {
              startComment: "//@nexquik prismaWhereParentClause start",
              endComment: "//@nexquik prismaWhereParentClause stop",
              insertString: whereparentClause,
            },
            {
              startComment: "//@nexquik prismaDeleteClause start",
              endComment: "//@nexquik prismaDeleteClause stop",
              insertString: deleteWhereClause,
            },
            {
              startComment: "//@nexquik revalidatePath start",
              endComment: "//@nexquik revalidatePath stop",
              insertString: revalidatePath,
            },
            {
              startComment: "{/* @nexquik listBreadcrumb start */}",
              endComment: "{/* @nexquik listBreadcrumb stop */}",
              insertString: listBreadCrumb,
            },
            {
              startComment: "{/* @nexquik createLink start */}",
              endComment: "{/* @nexquik createLink stop */}",
              insertString: createLink,
            },
            {
              startComment: "{/* @nexquik listForm start */}",
              endComment: "{/* @nexquik listForm stop */}",
              insertString: listFormCode,
            },
            {
              startComment: "{/* @nexquik listPagination start */}",
              endComment: "{/* @nexquik listPagination stop */}",
              insertString: listPagination,
            },
          ],
          modelTree.modelName
        )
      );

      // base/create/page.tsx
      childLoopPromises.push(
        modifyFile(
          path.join(templateModelDirectory, "create", "page.tsx"),
          path.join(baseModelDirectory, "create", "page.tsx"),
          [
            {
              startComment: "//@nexquik prismaEnumImport start",
              endComment: "//@nexquik prismaEnumImport stop",
              insertString: enumImport,
            },
            {
              startComment: "//@nexquik prismaCreateDataInput start",
              endComment: "//@nexquik prismaCreateDataInput stop",
              insertString: prismaCreateInput,
            },
            {
              startComment: "//@nexquik revalidatePath start",
              endComment: "//@nexquik revalidatePath stop",
              insertString: revalidatePath,
            },
            {
              startComment: "//@nexquik createRedirect start",
              endComment: "//@nexquik createRedirect stop",
              insertString: createRedirect,
            },

            {
              startComment: "{/* @nexquik createBreadcrumb start */}",
              endComment: "{/* @nexquik createBreadcrumb stop */}",
              insertString: createBreadCrumb,
            },
            {
              startComment: "{/* @nexquik createForm start */}",
              endComment: "{/* @nexquik createForm stop */}",
              insertString: createFormCode,
            },
          ],
          modelTree.modelName
        )
      );

      childLoopPromises = childLoopPromises.concat(
        modelTree.children.map(async (child) => {
          try {
            await generateRoutes(
              child,
              {
                name: route,
                uniqueIdentifierField: modelUniqueIdentifierField,
              },
              depth + 1,
              maxAllowedDepth
            );
          } catch (error) {
            console.error("An error occurred:", error);
          }
        })
      );
      await Promise.all(childLoopPromises);
    }
  }

  const startTime = new Date().getTime();

  // Start the main loop
  const mainLoopPromises = modelTreeArray.map(async (modelTree) => {
    try {
      await generateRoutes(
        modelTree,
        {
          name: "/",
          uniqueIdentifierField: [],
        },
        0,
        maxAllowedDepth
      );
    } catch (error) {
      console.error("An error occurred:", error);
    }
  });

  // Wait for all loop promises to complete
  await Promise.all(mainLoopPromises);
  process.stdout.write(`\u001b[2K\r`);
  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000;
  console.log(
    chalk.green(
      `\n\nCreated ${fileCount} files and ${directoryCount} directories in ${duration} seconds.\nCreated ${modelTreeArray.length} model(s) with a max depth of ${maxDepth}`
    )
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

  const fieldsToConvert: Partial<DMMF.Field>[] = modelTree.model.fields.filter(
    (field) => isFieldRenderable(field)
  );

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
  manyToManyWhere: string,
  selectClause: string
): string {
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
      return `({ where: { ${parentReferenceField}: {${parentIdentifierFieldName}: {equals: ${typecastValue}} }, }, ${selectClause} })`;
    } else {
      return `{${selectClause}}`;
    }
  } else {
    return `({ ${manyToManyWhere} , ${selectClause}}, )`;
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

      const checkboxStyle =
        field.type === "Boolean" ? "text-sky-700" : "text-slate-300 w-full";

      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label className="${labelClass}">${field.name} ${
          required && "*"
        } </label>\n

        <select name="${
          field.name
        }" className="${inputClass} ${checkboxStyle}" id="${field.name}">
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

            return `<label className="${labelClass}">${relationFrom} ${
              required && "*"
            }</label>\n
            <input type="${inputType2}" name="${relationFrom}"      
            className=" ${inputClass} ${checkboxStyle}"
            ${required}/>`;
          } else {
            return "";
          }
        }
      }

      let returnValue = "";
      if (isFieldRenderable(field)) {
        returnValue = `<label className="${labelClass}">${field.name} ${
          required && "*"
        }</label>\n
        <input type="${inputType}" name="${field.name}"    
        className="${inputClass} ${checkboxStyle}" ${required}/>`;
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
      const checkboxStyle =
        field.type === "Boolean" ? "text-sky-700" : "text-slate-300 w-full ";
      // Enum
      if (field.kind === "enum") {
        const enumValues = enums[field.type];
        return `<label className="${labelClass}">${field.name} </label>\n
              <select className="${inputClass} ${checkboxStyle}" name="${
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

      return `<label className="${labelClass}">${field.name} ${
        required && "*"
      }</label>\n<input    
       className="${
         disabled === "disabled" ? disabledInputClass : inputClass
       } ${checkboxStyle}" type="${inputType}" name="${field.name}"  ${
        field.type === "Boolean"
          ? `defaultChecked={nexquikTemplateModel?.${field.name} ?  nexquikTemplateModel.${field.name} : undefined}`
          : `defaultValue=${defaultValue}`
      } ${disabled} ${required}/>`;
    })
    .join("\n");
}
