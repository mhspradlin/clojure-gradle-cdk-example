import * as cdk from '@aws-cdk/core';
import { Distribution, IDistribution, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { HttpOrigin, S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { IApi } from '@aws-cdk/aws-apigatewayv2';
import { Bucket, IBucket } from '@aws-cdk/aws-s3';


export interface AppEndpointProps extends cdk.StackProps {
  appApi: IApi
}

export class AppEndpoint extends cdk.Stack {
  public readonly spaBucket: IBucket;
  public readonly distribution: IDistribution;

  constructor(scope: cdk.Construct, id: string, props: AppEndpointProps) {
    super(scope, id, props);

    const spaBucket = new Bucket(this, 'SPABucket');

    const distribution = new Distribution(this, 'AppDistribution', {
      defaultBehavior: {
        origin: new S3Origin(spaBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS // A good default
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new HttpOrigin(`${props.appApi.apiId}.execute-api.${props.appApi.env.region}.amazonaws.com`),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS // A good default
        }
      }
    });

    this.spaBucket = spaBucket;
    this.distribution = distribution;
  }
}
