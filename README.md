<br />
<h1>
<p align="center">
  <img align=top src="https://github.com/bcanfield/nexquik/assets/12603953/91861aeb-f7ff-4830-aded-760730a1057b" alt="Logo" width="140" height="140">
  <br>Nexquik
</h1>

  
  <p align="center">
  <strong>
    Transform your Prisma Models into stunning Next.js UI Components in seconds.
    </strong>
    </p>
     <p align="center">
     Auto-generate pieces of your app, allowing you to focus on refining your more custom components.
    </p>
    <p align="center">
     These will be <strong>Server Components</strong> fully equipped with <strong>Server Actions</strong>
    </p>
</p>
<p align="center">
  <a href="#usage">Usage</a> •
  <a href="#options">Options</a> •
  <a href="#use-cases">Use Cases</a> 
</p>                                                                                                         
                                                                                                                                                      
## Usage
### Example - Creating a new app from scratch
*Create a full Next.js app from scratch using all of your models*
```zsh
npm i nexquik -g
```

**Option 1: Add the generator to your Prisma Schema and run `prisma generate`**

```prisma
generator nexquik {
  provider = "prisma-generator-nexquik"
  command  = "--init group --name Main"
}
```
**Option 2: Use the command line**
```zsh
npx nexquik --init group --name Main
```
<br></br>
### Example - Initializing Nexquik in an existing app
*Install nexquik, install dependencies and required files, and generate some selected models into the app directory.*
```zsh
npm i nexquik
```
```zsh
nexquik deps
```
Now that we installed Nexquik and initialized it in the project, you can add the generator to your schema, and your UI will be generated every time you run `prisma generate`.


```prisma
generator nexquik {
  provider = "prisma-generator-nexquik"
  command  = "group --name UserManagement --include User,Admin,Organization group --name TaskManagement --include Task,Product,Category"
}
```

Keeping the generator in your schema will ensure that any time your models change, your UI will reflect them.

This also allows you to benefit from enhancements to the project from the open source community.


## Options
| Options                             | Description                                                                                                     |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| -V, --version                       | Output the version number                                                                                      |
| --schema <schemaLocation>           | Path to prisma schema file (default: "schema.prisma")                                                           |
| --output <outputDir>                | Path to root directory of your project (default: "./")                                                          |
| --init                              | Initializes a full Next.js app from scratch                                                                    |
| --extendOnly                        | Only creates the models specified in the current command, and leaves previously created ones alone.          |
| --appTitle <title>                  | Title to be used in the header of your app (default: "App")                                                     |
| --rootName <dirName>                | Desired name for the root app dir for your generated groups (this is the first directory nested under your 'app' directory. (default: "gen") |
| --depth <depthValue>                | Maximum recursion depth for your models. (Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also.) (default: "5") |
| --modelsOnly                        | Only generates components for your models. Skips the boilerplate files - root page.tsx,layout.tsx, globals.css, etc....          |
| --prismaImport <prismaImportString> | Import location for your prisma client if it differs from the standard setup. (default: "import prisma from '@/lib/prisma';") |
| --disabled                          | Disable the generator (default: false)                                                                         |
| -h, --help                          | Display help for command                                                                                      |

| Commands                            | Description                                                                                                     |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| group [options]                     | Create a group to organize your models into route groups. You can use this command multiple times to create many groups |
| deps                                | Install nexquik dependencies and copy over required config files. (tailwind, postcss, auto-prefixer, etc)     |
| help [command]                      | Display help for command                                                                                      |

### Disabled
To disable Nexquik from generating during a Prisma generate, you can either use the `--disabled` CLI option or set the following env var.
```zsh
DISABLE_NEXQUIK=true
```

## Use Cases
Portions of your app that rely on simple CRUD operations are prime candidates for auto-generation. Here are some examples.

### User Management
A user management section typically involves creating, reading, updating, and deleting user accounts. This could include functionalities like user registration, profile management, password reset, and account deletion.

### Admin Screens
Admin screens often require CRUD operations to manage various aspects of the application or website. This could include managing content, users, roles, permissions, settings, and more.

### Product Catalog
An e-commerce website's product catalog might involve creating, reading, updating, and deleting products. Admins could add new products, update product details, and remove products that are no longer available.

### Content Management System (CMS)
In a CMS, content creators might need to perform CRUD operations on articles, blog posts, images, and other types of content. They can create, edit, delete, and publish content.

### Task Management
For a task management app, users may need to perform CRUD operations on tasks. This includes adding new tasks, marking tasks as completed, updating task details, and deleting tasks.

### Customer Relationship Management (CRM)
CRM systems require basic CRUD operations to manage customer information. Users can add new contacts, update contact details, log interactions, and delete contacts if needed.

### Event Calendar
An event calendar app may involve CRUD operations for adding, updating, and deleting events. Users can create new events, edit event details, and remove events from the calendar.

### Inventory Management
For an inventory management system, CRUD operations could be used to manage stock items. Users can add new items, update quantities, adjust prices, and mark items as discontinued.

### Feedback or Comment System
Websites with user-generated content might need CRUD operations for handling feedback, comments, or reviews. Users can post new comments, edit their comments, and delete them.

### Polls or Surveys
Poll or survey applications may involve CRUD operations to manage questions, options, and responses. Admins can create new polls, update question wording, and analyze collected responses.

<br></br>
<div align="center">
  <!-- NPM version -->
  <a href="https://npmjs.org/package/nexquik">
    <img src="https://img.shields.io/npm/dt/nexquik"
      alt="NPM version" />
  </a>
  <!-- Build Status -->
  <a href="https://github.com/bcanfield/nexquik/actions/workflows/publish.yml">
    <img src="https://github.com/bcanfield/nexquik/actions/workflows/publish.yml/badge.svg"
      alt="Build Status" />
  </a>
  <!-- License -->
  <a href="https://npmjs.org/package/choo">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue"
      alt="Download" />
  </a>
</div>
               
