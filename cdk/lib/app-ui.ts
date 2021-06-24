import * as cdk from '@aws-cdk/core';
import { IBucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { IDistribution } from '@aws-cdk/aws-cloudfront';

export interface AppUIProps extends cdk.StackProps {
  bucket: IBucket,
  distribution: IDistribution
}

export class AppUI extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: AppUIProps) {
    super(scope, id, props);

    new BucketDeployment(this, 'AppUI', {
      sources: [Source.asset(this.node.tryGetContext("ui-assets-dir"))],
      destinationBucket: props.bucket,
      distribution: props.distribution
    });
  }
}
