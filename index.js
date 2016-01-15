
var AWS = require('aws-sdk');
var CloudFormation = new AWS.CloudFormation();
var Lambda = new AWS.Lambda();

module.exports = function(handler) {
  console.log('lambda-stack-context in use - context.Stack' +
    ' will be added before execution.');
  return function(event, context) {
    console.log('Accessing the lambda to check ' +
      'Description field: ' + context.invokedFunctionArn);
    Lambda.getFunctionConfiguration({
      FunctionName: context.invokedFunctionArn
    }, function(lambdaConfigErr, lambdaConfig) {
      if (lambdaConfigErr) {
        console.error('The lambda-stack-context ' +
          'could not be accessed - a failure occurred ' +
          'when accessing the FunctionConfiguration for ' +
          'the Lambda (' + context.invokedFunctionArn +
          ')', lambdaConfigErr);
        return context.fail(lambdaConfigErr);
      }
      console.log('Lambda Description returned fine, ' +
        'will DescribeStacks on: ' + lambdaConfig.Description);
      CloudFormation.describeStacks({
        StackName: lambdaConfig.Description
      }, function(cfnErr, cfn) {
        if (cfnErr) {
          console.error('The lambda-stack-context ' +
            'could not be accessed - a failure occurred ' +
            'when accessing DescribeStacks for ' +
            'the Stack (' + lambdaConfig.Description +
            ')', cfnErr);
          return context.fail(cfnErr);
        }
        var stack = cfn.Stacks[0];
        if (!stack) {
          console.error('The lambda-stack-context ' +
            'could not be accessed - DescribeStacks ' +
            'returned with no length for Stack (' +
            lambdaConfig.Description + ')', cfnErr);
          return context.fail(cfn);
        }
        context.Stack = {
          Parameters: (Stack.Parameters || [])
            .reduce(function(params, param) {
              params[param.ParameterKey] = param.ParameterValue;
              return params;
            }, {}),
          Outputs: (Stack.Outputs || [])
            .reduce(function(outputs, output) {
              outputs[output.OutputKey] = output.OutputValue;
              return outputs;
            }, {})
        };
        console.log('The Stack context was found ' +
          'correctly:', context.Stack);
        console.log('Proceeding to normal handler invocation.');
        handler(event, context);
      });
    });
  };
};
