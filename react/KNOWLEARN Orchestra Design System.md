# KNOWLEARN Orchestra Design System

## 1. Layout Structure
- **Global Layout**: `MainLayout`
    -   **Header**: Fixed top, height `h-14`, dark theme.
    -   **Sidebar**: Fixed left, width `w-64`, light theme, vertical navigation.
    -   **Content Area**: Flexible right side, light gray background (`bg-gray-50`).

## 2. Color Palette
-   **Primary Brand**: Blue 600 (`#2563eb`) - Used for active states, primary buttons, logo bg.
-   **Header Background**: Slate 800 (`#1e293b`) - Dark blue-grey.
-   **Page Background**: Gray 50 (`#f9fafb`) - Very light gray for the main canvas.
-   **Card Background**: White (`#ffffff`) - For content containers.
-   **Text**:
    -   Primary: Gray 900 (`#111827`)
    -   Secondary: Gray 500 (`#6b7280`)

## 3. Component Styles

### Cards
-   **Classes**: `bg-white rounded-lg shadow-sm border border-gray-200`
-   **Usage**: Container for forms, tables, and major content sections.

### Buttons
-   **Primary**: `bg-blue-600 hover:bg-blue-700 text-white rounded-md/lg`
-   **Secondary**: `border border-gray-300 text-gray-700 hover:bg-gray-50`

### Navigation
-   **Sidebar Item**:
    -   Default: `text-gray-600 hover:bg-gray-50`
    -   Active: `bg-blue-50 text-blue-700`

## 4. Icons
-   **Library**: `lucide-react`
-   **Style**: Simple, outlined icons (e.g., `User`, `Settings`, `Book`).
