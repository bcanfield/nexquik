![nexquik](https://github.com/bcanfield/nexquik/assets/12603953/611be768-106f-47b2-a94f-688f80f75132)
![npm](https://img.shields.io/npm/v/nexquik?style=flat-square&color=07198b)
![npm](https://img.shields.io/npm/dt/nexquik?style=flat-square&color=07198b)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square&color=07198b)
[![Build / Publish](https://github.com/bcanfield/nexquik/actions/workflows/publish.yml/badge.svg)](https://github.com/bcanfield/nexquik/actions/workflows/publish.yml)


**Nexquik** is a CLI tool to auto-generate Next.js full CRUD [server components](https://nextjs.org/docs/getting-started/react-essentials#server-components) & [server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) from a [Prisma](https://www.prisma.io/docs) schema. 

## Description

Nexquik reads your Prisma Schema and automatically creates React components and server actions for all your Prisma models. 

Say goodbye to manual CRUD implementation and hello to full CRUD capabilities in seconds!
This enables you to focus on building your application without spending time on repetitive tasks.

With Next.js server actions, you can harness the power of server-side logic within your React components. Reduce data transfer and supercharge your application's performance.

## Usage
All you need to get started is:
- A Prisma Schema
- A Next.js project
    - Using App Directory
    - In your next config, you will need to enable server actions since they are still in Alpha
    ```
        experimental: {
          appDir: true,
          serverActions: true,
        }
    ```

Nexquik supports the following parameters:

- `-schema <value>`: Path to prisma schema file (default: "./prisma/schema.prisma").
- `-out <value>`: Path to output directory (default: "nexquikApp").
- `-prismaImport <value>`: String to use for Prisma Import (default: "~/server/db").

## Examples
With defaults:
```bash
npx nexquik@latest
```
With params:
```bash
npx nexquik@latest -schema ./prisma/schema.prisma -out nexquikApp -prismaImport ~/server/db
```
![asdf](https://github.com/bcanfield/nexquik/assets/12603953/1362d685-3941-4b57-863e-a9d34db87d2c)

## Contributors
<a href="[https://github.com/t3-oss/create-t3-app/graphs/contributors](https://github.com/bcanfield/nexquik/graphs/contributors)">
  <p align="left">
    <img  src="https://contrib.rocks/image?repo=bcanfield/nexquik" alt="A table of avatars from the project's contributors" />
  </p>
</a>
