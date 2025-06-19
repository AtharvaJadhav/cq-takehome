
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  major: string;
  [key: string]: any; // Allow dynamic columns
}

export const mockStudents: Student[] = [
  { id: 1, firstName: "Alice", lastName: "Wong", major: "Computer Science" },
  { id: 2, firstName: "Bob", lastName: "Smith", major: "Mathematics" },
  { id: 3, firstName: "Carol", lastName: "Johnson", major: "Physics" },
  { id: 4, firstName: "David", lastName: "Brown", major: "Engineering" },
  { id: 5, firstName: "Eva", lastName: "Davis", major: "Biology" },
  { id: 6, firstName: "Frank", lastName: "Wilson", major: "Chemistry" },
  { id: 7, firstName: "Grace", lastName: "Miller", major: "Psychology" },
  { id: 8, firstName: "Henry", lastName: "Garcia", major: "Economics" },
  { id: 9, firstName: "Iris", lastName: "Martinez", major: "Art History" },
  { id: 10, firstName: "Jack", lastName: "Anderson", major: "Philosophy" },
];

// Default column structure
export const defaultColumns = [
  { field: 'firstName', headerName: 'First Name', width: 150, editable: true },
  { field: 'lastName', headerName: 'Last Name', width: 150, editable: true },
  { field: 'major', headerName: 'Major', width: 200, editable: true },
];
