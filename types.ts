import { LucideIcon } from 'lucide-react';

export enum NodeType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  LOGIC = 'LOGIC'
}

export enum BlockType {
  // Triggers
  ORDER_UPDATE = 'Order Update',
  APPOINTMENT_UPDATE = 'Appointment Update',
  DOCUMENT_UPDATE = 'Document/Form Update',
  REPORT_UPDATE = 'Report Update',
  TASK_UPDATE = 'Task Update',
  PROFILE_UPDATE = 'Profile Update',
  NEW_PATIENT = 'New Patient Created',
  MANUAL = 'Manual',
  SCHEDULED = 'Scheduled',

  // Actions
  SEND_MESSAGE = 'Send Message',
  APPOINTMENT = 'Appointment',
  TASK = 'Task',
  DOCUMENT = 'Document',
  ORDER = 'Order',
  NOTE = 'Note',

  // Logic
  WAIT = 'Wait',
  REVIEW_APPROVAL = 'Review & Approval',
  CONDITIONAL = 'Conditional',
  LOOP = 'Loop'
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  blockType: BlockType;
  title: string;
  description?: string;
  config?: Record<string, any>;
  isValid: boolean;
  tags?: string[];
  position: { x: number; y: number };
  isTemporary?: boolean; // For AI Review process
}

export interface ToolbarItem {
  type: NodeType;
  blockType: BlockType;
  iconName: string;
  label: string;
}