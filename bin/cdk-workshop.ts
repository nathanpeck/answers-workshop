#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VotingEnvironment } from '../lib/environment';
import { APIService } from '../lib/api';

const app = new cdk.App();
const votingEnvironment = new VotingEnvironment(app, 'VotingEnvironmentWorkshop', {});

const apiServiceStack = new APIService(app, "APIServiceWorkshop", {
  ecsEnvironment: votingEnvironment.ecsEnvironment,
  serviceDiscoveryName: votingEnvironment.serviceDiscoveryName
});