

### Purpose

Lambda does not allow parametrization. One way to add additional context is to pull context from a CloudFormation Stack that the function is a member of. By setting the Description field of a Lambda to the `AWS::StackId` inside your template and using this module, you can access Stack context without heavy listing or code generation.


### Usage

##### Within the CloudFormation Stack Template

You must grant the Lambda the `cloudformation:DescribeStacks`, and `lambda:GetFunctionConfiguration`. Additionally, you must set the `Description` element of the Lambda Function to the `StackId` for the currently running Stack:

```
"DomainTrainingInvoker": {
  // ... 
  "Type": "AWS::Lambda::Function",
  "Properties" : {
    // ...
    "Description": {
      "Ref": "AWS::StackId" // Set the Description to Ref::StackId
    },
    // ...
  }
  // ...
},
```

##### Access Content Within Lambda

Install using `npm i --save lambda-stack-context`


Then, within your function, to apply the context:


```
var WithStackContext = require('lambda-stack-context');

// MyOriginalHandler would be whatever function you'd normally export
var MyContextualizedHandler = WithStackContext(MyOriginalHandler);

exports.handler = MyContexualizedHandler;


function MyOriginalHandler(event, context) {
  // Contains the the stack information
  console.log(context.Stack);
  // Rest of your code like normal
}
```

##### Structure of `context.Stack`

The `context.Stack` object has some helpful properties you can use in your code.


###### `context.Stack.Parameters`

Contains the `Parameters` from the template, as key-value pairs.

###### `context.Stack.Outputs`

Contains the `Outputs` from the template, as key-value pairs.


### Technicalities

The system generates a function handler that looks like your original function. It grabs function context before the original handler executes, then runs your original function as a callback. This method is not recommended for latency-sensitive implementations, but is great for very simple rapid develop of connected systems.
