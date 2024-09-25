### Prerequisites

- **Docker**: 27.1.2
- **Node.js**: 18.20.4+


### Configure and build
```bash
git clone https://github.com/typestackapp/tsapp.git
cd tsapp
npm install
tsa init
tsa config --link=0
npm run build --workspaces --if-present
```

###  Start docker containers
```bash
docker-compose -f ./docker-dev/compose.core.certbot.yml up -d
docker-compose -f ./docker-dev/compose.core.haproxy.yml up -d
docker-compose -f ./docker-dev/compose.core.mongo.yml up -d
docker-compose -f ./docker-dev/compose.core.rabbitmq.yml up -d
docker-compose -f ./docker-dev/compose.core.tsapp.yml up -d
```

### Update and restart services
```bash
docker-compose -f ./docker-dev/compose.core.tsapp.yml exec tsapp /bin/bash
cd /tsapp
tsa update
pm2 ls
pm2 restart all
pm2 logs
```

### Access admin panel
```
username: test@test.com
password: root-psw
https://localhost:7443/admin
https://10.44.44.41:7443/admin
```


### Express endpoints examples
- [express/ping](packages/core/express/v1.0/test/[ping].ts)

### Graphql modules examples:
- [graphql/common](packages/core/graphql/common)
- [graphql/user](packages/core/graphql/user)
- [graphql/job](packages/core/graphql/job)
    
### Package folder structure:
- bin - docker entrypoint scripts
- codegen - automaticly generated code
- common - shared code between services
- components - react components
- configs
    - source - base config files, safe to save int git
        - access.json - access control for services
        - db.json - db connections
        - frontend.json - export config for frontend
        - graphql.json - grpahql shema and endpoint configs
        - rabbitmq.json - rabbitmq connections
        - services.json - pm2 services
        - system.json - core system config
        - templates.json - configs for templating
    - mod - overrides source configs, should not be saved in git
    - output - source and mod configs merged after running tsa config
- consumers - rabbitmq conumers
- docker - docker templates
- express - REST API endpopints
- graphql - GRAPHQL modules
- haproxy - proxy configs
- models - db ORM data models
- next - partial next.js project, whole next.js [codegen/next](packages/core/codegen/next)
- tailwind - tailwind config