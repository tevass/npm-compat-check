# npm-compat-check

A CLI tool to check compatibility between npm packages based on peer and dev dependencies.

## Installation

```bash
# Using npm
npm install -g compat-check

# Using pnpm
pnpm add -g compat-check

# Using yarn
yarn global add compat-check
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

The tool checks compatibility by:

1. Fetching all stable versions of the source package
2. Checking if the target package is listed in the source package's peer or dev dependencies
3. Verifying if the target package's version satisfies the version range specified in the source package's dependencies
4. Returning the first compatible version found

## Features

- ✅ Checks compatibility based on peer and dev dependencies
- ✅ Supports semantic versioning ranges
- ✅ Automatically uses latest stable version if not specified
- ✅ Colorful and informative terminal output

## Development

```bash
# Clone the repository
git clone https://github.com/username/npm-compat-check.git
cd npm-compat-check

# Install dependencies
pnpm install

# Create a symlink to run CLI locally
pnpm link .

# Build for production
pnpm build
```

After linking, you can run the CLI locally with the `compat-check` command.