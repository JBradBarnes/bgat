# begat

An attempt at functionaly data-driven code generation
That values simplicity in a language set

todo:
regex
params

Templating/Manifesting Language Documentation
Introduction
This documentation provides an overview of a templating and manifesting language designed for command-line execution. The language simplifies file manipulation and code generation through a set of built-in methods. This tool is intended for use in a command-line environment.

Getting Started
To use the language, follow these steps:

Install: Ensure you have the necessary dependencies installed for the language.

Run Code: Execute code using the command-line tool, providing input as arguments or using files.

View Output: Review the generated output or modified files as a result of the executed code.

Command-Line Usage
Execute code using the command-line tool, providing code directly or referencing code files.

bash
Copy code
// Below not right
templating-tool execute --code "File.write('output.txt', 'Hello, World!')"
bash
Copy code
// Below not right
templating-tool execute --file codeFile.bgat
Language Features
File Operations
The language supports various file operations:

File.write(filename, content): Writes content to a file.
File.read(filename): Reads content from a file.
File.glob(pattern): Performs glob matching to retrieve a list of files.
String Manipulation
String manipulation is achieved through methods inspired by JavaScript string methods:

String.replace(oldValue, newValue): Replaces occurrences of a substring.
String.concat(...values): Concatenates multiple strings or list elements.
String.toLowerCase(): Converts the string to lowercase.
String.toUpperCase(): Converts the string to uppercase.
And more...
Command Execution
The language allows execution of commands:

Cmd.run(code, params): Runs the specified code in a scoped environment.
Cmd.shell(command): Executes a shell command and returns the result.
List Operations
List operations include methods for joining and mapping:

List.join(separator): Joins the elements of a list into a string using a separator.
List.map(code): Maps each element of a list using the provided code.
Additional Features
Variable setting: String.set(value): Sets the value of a string variable.
Chaining: Supports chaining multiple operations together in a single command.
Templating: Allows the use of templates for dynamic content generation.
Examples
Writing a File
bash
Copy code
templating-tool execute --code "File.write('output.txt', 'Hello, World!')"
Using Variables
bash
Copy code
templating-tool execute --code "buf $file from 'Hello, World!' File.write('output.txt', $file)"
Executing Commands
bash
Copy code
templating-tool execute --code "buf $file from 'Hello, World!' Cmd.run('$file.set(\"Modified!\")') File.write('output.txt', $file)"
Built-in Methods
The language provides a set of built-in methods for file operations, string manipulation, and command execution. Refer to the tool's documentation for a complete list of available methods and their usage.

Customization
Extend the language by defining custom methods and incorporating them into your code. Refer to the language documentation for information on creating custom methods.

Conclusion
This templating and manifesting language simplifies file manipulation and code generation in a command-line environment. Use it to streamline your workflow and enhance your code generation capabilities. Explore different scenarios to leverage its full potential, and contribute to the project for further improvements. Happy coding!
