![nexquik](https://github.com/bcanfield/nexquik/assets/12603953/611be768-106f-47b2-a94f-688f80f75132)
![npm](https://img.shields.io/npm/v/nexquik?style=flat-square&color=07198b)
![npm](https://img.shields.io/npm/dt/nexquik?style=flat-square&color=07198b)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square&color=07198b)
[![Build / Publish](https://github.com/bcanfield/nexquik/actions/workflows/publish.yml/badge.svg)](https://github.com/bcanfield/nexquik/actions/workflows/publish.yml)


**Nexquik** is a CLI tool to auto-generate Next.js [server components](https://nextjs.org/docs/getting-started/react-essentials#server-components) & [server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) from a [Prisma](https://www.prisma.io/docs) schema. 

Get started by running `npx nexquik@latest` in your Next.js Project.

## Description

By providing full CRUD capabilities in seconds, it streamlines the initial setup process and enables you to focus on building your Next.js application without spending time on repetitive tasks.

Next.js server actions are a game-changer as they allow usage of server-side logic within your React components, and reduce the amount of data needed to be sent across the web.



All you need to get started is:
- A Next.js project (using app directory)
- A Prisma Schema

Nexquik supports the following parameters:

- `-schema <value>`: Path to prisma schema file (default: "./prisma/schema.prisma").
- `-out <value>`: Path to output directory (default: "nexquikApp").
- `-prismaImport <value>`: String to use for Prisma Import (default: "~/server/db").
