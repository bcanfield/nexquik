<br />
<h1>
<p align="center">
  <img align=top src="https://github.com/bcanfield/nexquik/assets/12603953/91861aeb-f7ff-4830-aded-760730a1057b" alt="Logo" width="140" height="140">
  <br>Nexquik
</h1>

  
  <p align="center">
    Transform your database schema into a Stunning Next.js app in seconds
    <br />
    </p>
</p>
<p align="center">
  <a href="#cli-usage">CLI Usage</a> •
  <a href="#prisma-generator-usage">Prisma Generator Usage</a> •
  <a href="#options">Options</a> •
  <a href="#continuous-usage">Continuous Usage</a> 
</p>                                                                                                         
                                                                                                                                                      
## CLI Usage
```zsh
npx nexquik -schema schema.prisma
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
}
```
Generate
```zsh
npx prisma generate
```


## Options
| Option    | Description                                                                                                                                                       | Default       | Required |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| schema \<value\>  | Path to prisma schema file                                                                                                                                        | schema.prisma | false    |
| output \<value\>    | Path to output directory                                                                                                                                          | nexquikApp    | false    |
| include \<value\> | Comma-separated list of model names to include from the top-level of the generated app |   | false  |
| exclude \<value\>  | Comma-separated list of model names to exclude from the top-level of the generated app (NOTE: If the 'include' option is used, this exclusion list will be ignored) |               | false    |
| depth \<value\>  | Maximum recursion depth for your models. (Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also.) |     5          | false    |
| modelsOnly   | Output only the model directories in your desired output location, excluding the main directory files. |               | false    |

### Disabled
To disable Nexquik from generating during a Prisma generate, add the following environmental variable.
```zsh
DISABLE_NEXQUIK=true
```

## Continuous Usage
Nexquik is built to help you throughout the entire lifecycle of your project.

It allows you to choose pieces of your application to be generated, while leaving other pieces un-touched. 

```zsh
nexquik -output ./nexquikApp/app -modelsOnly -include User,Admin,Role
```

This has proven to be extremely useful for portions of your app that rely on simple CRUD operations. Here are some prime use-cases for this type of system.

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
               
