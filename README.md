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
  <a href="#examples">Examples</a> 
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
| schema  | Path to prisma schema file                                                                                                                                        | schema.prisma | false    |
| output     | Path to output directory                                                                                                                                          | nexquikApp    | false    |
| include   | Comma-separated list of model names to include from the top-level of the generated app |   | false  |
| exclude   | Comma-separated list of model names to exclude from the top-level of the generated app (NOTE: If the 'include' option is used, this exclusion list will be ignored) |               | false    |
| depth   | Maximum recursion depth for your models. (Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also.) |     5          | false    |

### Disabled
To disable Nexquik from generating during a Prisma generate, add the following environmental variable.
```zsh
DISABLE_NEXQUIK=true
```

## Examples
```prisma
generator nexquik {
    provider = "prisma-generator-nexquik"
    output   = "yourOutputDirectory"
    exclude  = "ModelOne,ModelTwo"
}
```
```prisma
generator nexquik {
    provider = "prisma-generator-nexquik"
    output   = "yourOutputDirectory"
    include  = "ModelThree"
}
```
```zsh
npx nexquik -schema mySchema.prisma -output myOutputDirectory -exclude ModelOne,ModelTwo
```
```zsh
npx nexquik -schema mySchema.prisma -output myOutputDirectory -include ModelThree
```
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
               
