# Clojure + Gradle + CDK Example

This project is an example of how to connect the code and infrastructure for a
small web project written in Clojure and ClojureScript. The main idea is that
full CI/CD infrastructure is overkill for many small projects but it is still
valuable to model any infrastructure in code (if only to make it easier to 
delete.) I couldn't find any examples of connecting the output of backend
and UI code to the CDK using Gradle, so I created this example to see how it
could be done.

## Explanation

This project is a monorepo of all the components needed for the application.
Each component is a
[Gradle subproject](https://docs.gradle.org/current/userguide/multi_project_builds.html)
where the necessary build inputs and outputs are connected to each other via
[Gradle's output sharing mechanisms](https://docs.gradle.org/current/userguide/cross_project_publications.html#cross_project_publications).
There's four subprojects:
* `app-ui`: ClojureScript SPA using [Figwheel Main](https://figwheel.org/)
* `app-server`: Clojure web server using [deps.edn](https://clojure.org/guides/deps_and_cli) and [depstar](https://github.com/seancorfield/depstar)
* `packaging`: Gradle-only project to stage the uberjar from app-server to be run in a Docker image
* `cdk`: Typescript [AWS CDK](https://aws.amazon.com/cdk/) package to deploy the SPA and Docker image onto AWS

### `app-ui`

The only changes from the standard Figwheel main template is the addition of a
button that calls the "hello world" API on the backend. The build is managed
by the usual Clojure CLI tools. The `copyAssets` build task reaches into the
Figwheel compilation output and copies the minified assets to Gradle's build
output folder, filtering out the test HTML page.

### `app-server`

Created from a template, no significant alterations to the code. The build is
managed by the usual Clojure CLI tools. 
[depstar](https://github.com/seancorfield/depstar) is used to create an uberjar
(ahead-of-time compiled output with all dependencies) of the server. The
`buildUberjar` task simply copies the uberjar to Gradle's build output.

### `packaging`

Conceptually, the code in `app-server` could be run in a variety of
environments. The first such environment you'll encounter is on your local
development machine, which is certainly different than what's running in
AWS Fargate (or EC2, or Azure, etc.) The idea behind the `packaging` project
is that it isolates `app-server` from having to understand all the different
platforms it might be deployed and run on. It is also generally easier to
manage the packaging process if there's a clear handoff between the
application compiler and the packaging step, and the explicit modeling of
inputs/outputs using Gradle is good for that.

This copies the uberjar from the `app-server` project along with the
Dockerfile and run_server.sh script into the Gradle build output for this
project. It locates and names the files such that the CDK is able to build
the Dcokerfile.

### `cdk`

Models the infrastructure for the application:
* A VPC to run in
* An ECS Fargate cluster for the web API
* An ECS Fargate service and load balancer for the web API
* An S3 bucket for the SPA
* A CloudFront distribution that routes to the SPA and web API

The special sauce here is how the build output from the other
projects is handed to the CDK for upload at deployment time. This uses the
[CDK context](https://docs.aws.amazon.com/cdk/latest/guide/context.html) passed
via command-line arguments that are read by the appropriate constructs. Namely:
* For the SPA, `BucketDeployment`
* For the web server, `DockerImageAsset`

When you run `cdk deploy`, the CDK will copy the SPA assets to the bucket,
build the Docker image, and upload the Docker image to ECR to be used by the
rest of the infrastructure.

## Running

You need a few things installed to deploy this:
* An AWS account
* The [AWS CLI](https://aws.amazon.com/cli/) configured with credentials that can be used to deploy everything from the command line
* The [CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)
* The [Docker CLI](https://docs.docker.com/engine/install/)
* The [Clojure CLI](https://clojure.org/guides/getting_started)
* [Node JS](https://nodejs.org/en/), I recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node installation

Once you're all set up, you can simply run `./gradlew deploy` and Gradle will
manage building all the subprojects and invoking the CDK. If you make changes
you can run `./gradlew deploy` and Gradle will manage rebuilding the changed
projects and invoking the CDK again.

Please note: **This infrastructure costs you money**; it cost about $12/month when I had it running, almost entirely due to the NAT gateway on the VPC private subnet. YMMV depending on if you're still in the free
tier and what region you deploy to.

If you want to delete the infrastructure, navigate to the CloudFormation page in the AWS console and delete the stacks that the CDK created. There are inter-stack
dependencies, so you need to delete them in reverse
dependency order. Luckily the stack deletion fails fast
if it cannot be deleted because of inter-stack dependencies,
so it's not so bad even if you have to use trial-and-error. The stack dependencies are clear if you
look at `bin/cdk.ts` in the `cdk` subproject.

## Next Places to Look

If you want to use this for more than a prototype, then you should set
up logging and monitoring for the web server. [AWS Firelens](https://aws.amazon.com/about-aws/whats-new/2019/11/aws-launches-firelens-log-router-for-amazon-ecs-and-aws-fargate/) is the latest hotness for log routing in AWS Fargate, the [X-Ray daemon](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-ecs.html) is good for collecting X-Ray traces. An alternative to look at
is the [AWS distribution for OpenTelemetry](https://aws.amazon.com/otel/) for collecting logs/metrics/traces.

This uses Gradle's `configuration` blocks for sharing artifacts between
subprojects, but the `artifacts` block might actually be more appropriate.

Many applications need some sort of authentication and authorization.
I don't recommend trying to call [Cognito](https://aws.amazon.com/cognito/)
APIs directly. I've had good success with using the [AWS Amplify](https://github.com/aws-amplify/amplify-js) library to manage user tokens and API integrations. The built-in [Cognito Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)
for API gateway is simple to use and should handle basic usecases
without your web server needing to call Cognito.