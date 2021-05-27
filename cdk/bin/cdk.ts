#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AppVpc } from '../lib/app-vpc';
import { AppCluster } from '../lib/app-cluster';
import { AppService } from '../lib/app-service';

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};
const appVpc = new AppVpc(app, 'AppVpc', {
  env
});

const appCluster = new AppCluster(app, 'FinchCluster-Prod', {
  env,
  vpc: appVpc.vpc
});
appCluster.addDependency(appVpc, "FinchCluster requires a VPC to run in");

const appService = new AppService(app, 'FinchService-Prod', {
  env,
  cluster: appCluster.cluster
});
appService.addDependency(appService, "FinchService needs a Cluster to run on");
