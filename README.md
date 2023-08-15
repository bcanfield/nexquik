<!-- LOGO -->
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
  <a href="#options">Options</a> 
</p>  
                                                                                                                      
                                                                                                                                                      
## CLI Usage
```zsh
npx nexquik -schema schema.prisma
```

## Prisma Generator Usage
Add to your Prisma schema

```prisma
generator Nexquik {
    provider = "prisma-generator-nexquik"
}
```
Generate
```zsh
npx prisma generate
```


## Options
```lua
  -schema               Path to prisma schema file (default: "./prisma/schema.prisma")
  -out                  Path to output directory (default: "nexquikApp")
  -exclude              Comma-separated list of model names to exclude
  -include              Comma-separated list of model names to include
```
By default, all of your database models will be created. 

If you exclude models, they will not be generated in the top-level of your app, but they will still be present as children of your other top-level models.

If you specify models to include, only those models will be generated at the top-level. But all of their children will be generated. This will also over-write any value you set for your exclusion list.
