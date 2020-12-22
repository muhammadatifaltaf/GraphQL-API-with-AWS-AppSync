import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, "API", {
      name: 'cdk-appsync-api-new',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),       ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))   ///set expiration for API Key
          }
        },
      },                                           ///Enables xray debugging
    });
    const Mylambda = new lambda.Function(this, "MyFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda"),          ///path for lambda function directory
      handler: 'welcome.handler',                       ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10)               ///Time for function to break. limit upto 15 mins
    });
    const lambda_data_source = api.addLambdaDataSource("MylamdaDataSource", Mylambda);
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "welcome"
    });
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "hello"
    });
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "addProduct"
    });
    
    const url = new cdk.CfnOutput(this, 'GraphQLURL',{
      value: api.graphqlUrl
    });
    const key = new cdk.CfnOutput(this, 'GraphQLAPI',{
      value: api.apiKey || ''
    });
  } 
}
