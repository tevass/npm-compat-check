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
compat-check <target> <source>
```

Where:
- `<target>` - Target package with version (e.g., react@18.2.0)
- `<source>` - Source package to check for compatibility

If you don't specify a version for the target package, the CLI will use the latest stable version.

### Examples

```bash
# Check which version of @emotion/react is compatible with react@18.2.0
compat-check react@18.2.0 @emotion/react

# Check which version of react-router-dom is compatible with the latest version of react
compat-check react react-router-dom
```

## How It Works

The tool checks compatibility through the following steps:

1. Fetches all stable versions of the source package
2. Checks if the target package is listed in the source package's regular or peer dependencies
3. Verifies if the target package's version satisfies the version range specified in the source package's dependencies
4. Returns the first compatible version found

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

After linking, you can run the CLI locally with the `compat-check` command.