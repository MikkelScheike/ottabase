# @ottabase/forms

Auto-generated CRUD Forms for OttaORM Models.

## Features

- **Auto-generated Forms**: Create forms instantly from your OttaORM model definitions.
- **Auto-generated Tables**: Display model data in sortable, paginated tables.
- **CRUD Views**: Full `ModelCrud` component for List, Create, Update, and Detail views.
- **Customizable**: Override fields, layouts, and behaviors.
- **Type-safe**: Built with TypeScript and seamlessly integrates with OttaORM types.

## Installation

```bash
pnpm add @ottabase/forms
```

## Usage

### Basic CRUD Interface

The `ModelCrud` component provides a complete management interface for a model.

```tsx
import { ModelCrud } from '@ottabase/forms';
import { User } from '@/ottabase/models/User'; // Your OttaORM model class

export function UserManagement() {
    return <ModelCrud model={User} basePath="/admin/users" onNavigate={(path) => navigate(path)} />;
}
```

### Individual Components

You can also use the individual components for more granular control.

#### ModelForm

```tsx
import { ModelForm } from '@ottabase/forms';
import { User } from '@/ottabase/models/User';

function CreateUser() {
    return <ModelForm model={User} mode="create" onSuccess={() => alert('User created!')} />;
}
```

#### ModelTable

```tsx
import { ModelTable } from '@ottabase/forms';
import { useUsers } from '@/ottabase/hooks/useUser';

function UserList() {
    const { data, isLoading } = useUsers();

    return <ModelTable data={data} isLoading={isLoading} onRowClick={(row) => navigate(`/users/${row.id}`)} />;
}
```

## Configuration

You can customize how models are displayed using `defineModelConfig` or static properties on your model.

```typescript
// In your model definition
export class User extends BaseModel {
    // ... model config ...

    static formConfig = {
        fields: {
            email: { label: 'Email Address', required: true },
            role: {
                type: 'select',
                options: [
                    { label: 'Admin', value: 'admin' },
                    { label: 'User', value: 'user' },
                ],
            },
        },
        listFields: ['email', 'role', 'createdAt'],
    };
}
```

## Exports

- **Components**: `ModelCrud`, `ModelForm`, `ModelTable`, `ModelDetail`, `FormField`
- **Utilities**: `createModelConfig`, `defineModelConfig`
- **Types**: `ModelConfig`, `ModelCrudProps`, etc.
