# React Project Structure Best Practices

A comprehensive guide and reference implementation for structuring large-scale React applications with modern best practices.

## 🚀 What This Project Is

This repository contains a complete React TypeScript project architecture guide that demonstrates:

- **Modern React patterns** with TypeScript
- **Zedux state management** for scalable applications
- **Centralized architecture** for maintainable codebases
- **Type-safe API integration** with Zod validation
- **Feature-based organization** for scalable development

## 📚 Complete Documentation Suite

### 📖 Main Overview
- **[React Project Architecture Guide](./docs/react-project-architecture-doc.md)** - Complete overview of the entire architecture, folder structure, and core principles

### 🔍 Specialized Guides
Each guide deep-dives into specific aspects of the architecture:

- **[UI Layer Architecture](./docs/pages-vs-features-vs-components-guide.md)** - Three-layer UI structure (Pages → Features → Components) with clear boundaries and decision matrices
- **[Services Layer Guide](./docs/services-layer-guide.md)** - API abstraction patterns, service architecture, and HTTP communication best practices
- **[Types & Schemas Organization](./docs/types-schemas-guide.md)** - TypeScript types and Zod schema organization, validation strategies
- **[App & Ecosystem Setup](./docs/app-ecosystem-docs.md)** - Zedux ecosystem configuration, plugins, dependency injection, and global state management

## 🏗️ Architecture Highlights

- **Centralized Business Logic**: Services, types, and schemas in one place
- **Feature-Based UI**: Components and state management organized by features
- **Type Safety**: Full TypeScript coverage with runtime validation
- **Scalable State**: Zedux atoms and ions for predictable state management
- **Clean Separation**: Clear boundaries between presentation, business logic, and data contracts

## 🛠️ Tech Stack

- **React 18+** with TypeScript
- **Zedux** for atom-based state management
- **Zod** for schema validation
- **Axios** for API communication
- **Modern tooling** and best practices

## 🎯 Use Cases

Perfect for:
- Large-scale React applications
- Teams looking for scalable architecture patterns
- Projects requiring maintainable, type-safe code
- Developers wanting to learn modern React patterns

## 📁 Project Structure

The architecture follows a clear, scalable structure:

```
src/
├── features/          # Feature-based modules
├── services/          # Centralized API services
├── types/            # TypeScript type definitions
├── schemas/          # Zod validation schemas
├── atoms/            # Global state atoms
├── components/       # Shared components
└── ...
```

## 🔗 Quick Links

- **[📖 Full Architecture Guide](./docs/react-project-architecture-doc.md)**
- **[🏗️ Folder Structure Details](./docs/react-project-architecture-doc.md#folder-structure)**
- **[⚡ State Management Patterns](./docs/react-project-architecture-doc.md#state-management-with-zedux)**
- **[🔌 API Services Layer](./docs/react-project-architecture-doc.md#api-services-layer)**

## 📝 License

This project is open source and available under the [LICENSE](LICENSE) file. 
