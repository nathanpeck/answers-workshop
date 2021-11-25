import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as extensions from '@aws-cdk-containers/ecs-service-extensions';
import { CloudWatchLogsExtension } from './awslogs-extension';
import { HttpLoadBalancer } from './load-balancer';

interface NginxMicroserviceProps {
  ecsEnvironment: extensions.Environment,
  voteService: extensions.Service,
  resultsService: extensions.Service
}

export class NginxService extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: NginxMicroserviceProps) {
    super(scope, id);

    var voteLoadBalancer = props.voteService.serviceDescription.get('load-balancer') as HttpLoadBalancer;
    var resultsLoadBalancer = props.resultsService.serviceDescription.get('load-balancer') as HttpLoadBalancer;

    const nginxServiceDesc = new extensions.ServiceDescription();
    nginxServiceDesc.add(new extensions.Container({
      cpu: 256,
      memoryMiB: 512,
      trafficPort: 80,
      image: ecs.ContainerImage.fromAsset('./services/nginx/', { file: 'Dockerfile' }),
      environment: {
        VOTE_URL: 'http://' + voteLoadBalancer.getUrl(),
        RESULTS_URL: 'http://' + resultsLoadBalancer.getUrl(),
      }
    }));

    nginxServiceDesc.add(new HttpLoadBalancer());
    nginxServiceDesc.add(new CloudWatchLogsExtension());

    const service = new extensions.Service(this, 'nginx', {
      environment: props.ecsEnvironment,
      serviceDescription: nginxServiceDesc,
    });
  }
}