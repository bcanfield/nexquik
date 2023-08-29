<br />
<h1>
<p align="center">
  <img align=top src="https://github.com/bcanfield/nexquik/assets/12603953/91861aeb-f7ff-4830-aded-760730a1057b" alt="Logo" width="140" height="140">
  <br>Nexquik
</h1>

  
  <p align="center">
  <strong>
    Transform your Prisma Models into stunning Next.js Server Components in seconds.
    </strong>
    </p>
     <p align="center">
     Auto-generate pieces of your app, allowing you to focus on refining your more custom components.
    </p>
</p>
<p align="center">
  <a href="#cli-usage">CLI Usage</a> •
  <a href="#prisma-generator-usage">Prisma Generator Usage</a> •
  <a href="#options">Options</a> •
  <a href="#use-cases">Use Cases</a> 
</p>                                                                                                         
                                                                                                                                                      
## CLI Usage
Example - Creating an entire Next.js app from scratch using all of your models
```zsh
npx nexquik group --name Main --init
```

Example - In an existing Next.js app, create an Admin route group for your user-related db models, and auto-install Nexquik dependencies.
```zsh
npx nexquik group --name Admin --include User,Role,Capability --deps
```

Example - Create multiple groups
```zsh
npx nexquik group --name Tasks --include Task,Comment,Attachment --name Admin --include User,Role,Capability
```

## Prisma Generator Usage
Install
```zsh
npm install nexquik
```
Add to your Prisma schema

```prisma
generator nexquik {
    provider = "prisma-generator-nexquik"
    command  = "group --name Admin --include User,Role,Capability"
}
```
Generate
```zsh
npx prisma generate
```


## Options
| Option                                   | Description                                                                                              | Default Value                     |
|------------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------|
| `--schema <schemaLocation>`               | Path to prisma schema file.                                                                             | "schema.prisma"                   |
| `--output <outputDir>`                   | Path to output directory.                                                                               | "./"                              |
| `--init`                                 | Initializes a full Next.js app from scratch.                                                             |                                   |
| `--extendOnly`                           | Only creates the models specified in the current command, and leaves previously created ones alone.    |                                   |
| `--appTitle <title>`                     | Title to be used in the header of your app.                                                             | "App"                             |
| `--rootName <dirName>`                   | Desired name for the root app dir for your generated groups (this is the first directory nested under your 'app' directory). | "gen"                       |
| `--deps`                                 | Auto npm install dependencies in your output directory. (Not necessary when using --init)                                                 | false                             |
| `--depth <depthValue>`                   | Maximum recursion depth for your models. Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also. | "5" |
| `--prismaImport <prismaImportString>`    | Import location for your prisma client if it differs from the standard setup.                            | "import prisma from \"@/lib/prisma\";" |
| `--disabled`                             | Disable the generator.                                                                                  | false                             |
| `-h, --help`                             | Display help for command.                                                                               |                                   |

| Command                  | Description                                                                      |
|--------------------------|----------------------------------------------------------------------------------|
| `group [options]`        | Create a group to organize your models into route groups. You may create One-to-many of these. |
| `help [command]`         | Display help for command.                                                        |

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
               
