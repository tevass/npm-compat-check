# npm-compatible

A CLI tool to check compatibility between npm packages based on their regular and peer dependencies.

## Installation

```bash
# Using npm
npm install -g npm-compatible

# Using pnpm
pnpm add -g npm-compatible

# Using yarn
yarn global add npm-compatible
```

## Usage

```bash
# Check compatibility between packages
npm-compatible <target> <base> 
```

Where:
- `<base>` - Base package with version (e.g., react@18.2.0)
- `<target>` - Target package to check for compatibility

If you don't specify a version for a package, the CLI will use the latest stable version.

### Examples

```bash
# Check if react@18.2.0 is compatible with latest version of @emotion/react
npm-compatible react@18.2.0 @emotion/react

# Check if the latest version of react is compatible with react-router-dom
npm-compatible react react-router-dom
```

## How It Works

The tool checks compatibility through the following steps:

1. Fetches all stable versions of the base package
2. Checks if the target package is listed in the base package's regular or peer dependencies
3. Verifies if the target package's version satisfies the version range specified in the base package's dependencies
4. Returns compatibility status with relevant information

## Features

- ✅ Checks compatibility based on regular and peer dependencies
- ✅ Supports semantic versioning ranges
- ✅ Automatically uses latest stable version if not specified
- ✅ Colorful and informative terminal output
- ✅ Support for different package specification formats (e.g., @scope/package, package@version)

## Development

```bash
# Clone the repository
git clone https://github.com/tevass/npm-compatible.git
cd npm-compatible

# Install dependencies
pnpm install

# Build for production
pnpm build

# Create a symlink to run CLI locally
pnpm link . -g
```

After linking, you can run the CLI locally with the `npm-compatible` command.