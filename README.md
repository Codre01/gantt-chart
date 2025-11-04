# Mini Task Tracker Dashboard

A modern, accessible Gantt-style task visualization dashboard built with Next.js, TypeScript, and Tailwind CSS. This application provides an interactive timeline view for managing project tasks with full CRUD operations, filtering, and keyboard navigation.

## Features

- **Multi-Project Management**: Switch between different projects and view their task timelines
- **Gantt Timeline Visualization**: Interactive timeline with day and week views
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Advanced Filtering**: Filter tasks by status, assignee, and search by title
- **Status Visualization**: Color-coded task bars with status icons and patterns
- **Keyboard Navigation**: Full keyboard accessibility with arrow key navigation
- **WCAG AA Compliant**: Meets accessibility standards with ARIA labels and screen reader support
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Linting/Formatting**: Biome

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Local Development

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:

```bash
npm install
```

3. **Run the development server**:

```bash
npm run dev
```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

The application will hot-reload as you make changes to the code.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server (requires build first)
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Docker Deployment

The application includes Docker configuration for easy deployment.

### Using Docker Compose (Recommended)

1. **Build and start the container**:

```bash
docker-compose up
```

This will build the Docker image and start the container on port 3000.

2. **Access the application** at [http://localhost:3000](http://localhost:3000)

3. **Stop the container**:

```bash
docker-compose down
```

### Using Docker Directly

1. **Build the Docker image**:

```bash
docker build -t task-tracker .
```

2. **Run the container**:

```bash
docker run -p 3000:3000 task-tracker
```

3. **Access the application** at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn-ui components
│   ├── FilterControls.tsx
│   ├── GanttTimeline.tsx
│   ├── ProjectSelector.tsx
│   ├── TaskBar.tsx
│   ├── TaskForm.tsx
│   └── ZoomControl.tsx
├── contexts/             # React Context providers
│   └── TaskContext.tsx   # State management
├── data/                 # Initial seed data
│   └── initialData.ts
├── lib/                  # Utility functions
│   ├── timelineUtils.ts  # Timeline calculations
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── index.ts
```

## Usage Guide

### Managing Projects

- Select a project from the project list at the top of the dashboard
- The selected project is highlighted with a blue border
- Use arrow keys or click to navigate between projects

### Creating Tasks

1. Click the "Add Task" button
2. Fill in the task details:
   - Title (required)
   - Status (required)
   - Assignee (required)
   - Start Date (required)
   - End Date (required)
   - Dependency (optional)
3. Click "Create Task" to save

### Editing Tasks

1. Click on a task bar in the timeline
2. Modify the task details in the form
3. Click "Update Task" to save changes

### Deleting Tasks

1. Click on a task bar to open the edit form
2. Click the "Delete Task" button
3. Confirm the deletion in the dialog

### Filtering Tasks

- **Status Filter**: Select one or more statuses to filter tasks
- **Assignee Filter**: Select one or more assignees to filter tasks
- **Search**: Type in the search box to filter by task title
- **Clear Filters**: Click "Clear Filters" to reset all filters

### Timeline Views

- **Day View**: Shows individual days (40px per day)
- **Week View**: Shows weeks (80px per week)
- Toggle between views using the zoom control buttons

### Keyboard Navigation

- `Tab`: Navigate to the timeline and between task bars
- `↑/↓`: Move focus between tasks
- `Enter`: Open task details for editing
- `Escape`: Close dialogs and forms
- `Tab` (in forms): Navigate between form fields

## Component Documentation

### Core Components

#### TaskContext

Manages application state using React Context and useReducer pattern.

**State Structure**:
```typescript
interface TaskState {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;
  filters: {
    status: string[];
    assignee: string[];
    searchText: string;
  };
  timelineView: 'day' | 'week' | 'month';
}
```

**Actions**: `SELECT_PROJECT`, `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `SET_FILTER`, `SET_SEARCH`, `SET_TIMELINE_VIEW`

#### GanttTimeline

Main timeline visualization component that renders the date axis and task bars.

**Props**:
```typescript
interface GanttTimelineProps {
  tasks: Task[];
  timelineView: 'day' | 'week' | 'month';
  onTaskSelect: (taskId: string) => void;
}
```

#### TaskBar

Individual task visualization with status-based styling.

**Props**:
```typescript
interface TaskBarProps {
  task: Task;
  timelineStart: Date;
  pixelsPerDay: number;
  onSelect?: (taskId: string) => void;
  isSelected?: boolean;
  taskIndex?: number;
}
```

**Status Colors**:
- Not Started: Gray (#9CA3AF) with dashed border
- In Progress: Blue (#3B82F6) with progress icon
- Completed: Green (#10B981) with checkmark icon
- Blocked: Red (#EF4444) with diagonal stripes

#### TaskForm

Form component for creating and editing tasks with validation.

**Props**:
```typescript
interface TaskFormProps {
  task?: Task;
  projectId: string;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}
```

**Validation Rules**:
- Title is required
- Status is required
- Assignee is required
- Start date is required
- End date is required and must be >= start date

### Utility Functions

#### Timeline Calculations (`src/lib/timelineUtils.ts`)

- `calculateTimelineRange(tasks)`: Calculates the date range for the timeline
- `calculateTaskPosition(task, timelineStart, pixelsPerDay)`: Calculates task bar position and width
- `calculateTodayPosition(timelineStart, pixelsPerDay)`: Calculates today marker position
- `differenceInDays(date1, date2)`: Calculates days between two dates
- `generateDateRange(start, end)`: Generates array of dates
- `generateWeekRange(start, end)`: Generates array of week start dates

## Data Models

### Project

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}
```

### Task

```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  startDate: Date;
  endDate: Date;
  dependencyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';
```

## Accessibility

This application is built with accessibility as a core requirement:

- **WCAG AA Compliant**: All text and interactive elements meet contrast requirements
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: ARIA labels, roles, and descriptions throughout
- **Focus Management**: Logical focus order and focus trapping in dialogs
- **Semantic HTML**: Proper use of semantic elements and ARIA roles

For detailed accessibility information, see [ACCESSIBILITY.md](./ACCESSIBILITY.md).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Initial page load: < 2 seconds
- Task CRUD operations: < 100ms
- Filter/search response: < 200ms (with 300ms debouncing)
- Timeline view switch: < 300ms

## Future Enhancements

Potential features for future iterations:

- Backend API and database persistence
- Real-time collaboration with WebSockets
- Drag & drop task repositioning
- Task dependency visualization with connecting lines
- Export timeline as PDF or image
- Dark mode support
- Mobile-optimized touch interface
- Project progress analytics dashboard

## Contributing

This is a demonstration project. For production use, consider:

- Adding backend persistence (database)
- Implementing authentication and authorization
- Adding comprehensive test coverage
- Setting up CI/CD pipelines
- Implementing error tracking and monitoring

## License

This project is for demonstration purposes.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn-ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
