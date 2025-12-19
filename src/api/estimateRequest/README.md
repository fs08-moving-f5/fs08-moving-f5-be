```bash
estimateReq
  - user
    - estimateReq.user.routes.ts
    - estimateReq.user.controller.ts
    ...
  - driver
    - estimateReq.driver.routes.ts
    - estimateReq.driver.controller.ts
    ...
```

`src/api/index.ts`

```bash
router.use('/estimate', estimateRouter);

# 유저
router.use('/estimate-request/user', userEstimateReqRouter);

# 기사님
router.use('/estimate-request/driver', driverEstimateReqRouter)
```

채원님이 폴더구조 한 번 정리해서 `develop` 으로 PR Merge 되면,  
승찬님이 이어서 작업해주세요!
