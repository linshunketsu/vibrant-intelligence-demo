import { 
  ShoppingCart, Calendar, FileText, ClipboardList, 
  CheckSquare, User, UserPlus, MousePointerClick, 
  Clock, Mail, AlertCircle, Repeat, GitBranch, 
  ShieldCheck, StickyNote
} from 'lucide-react';
import { NodeType, BlockType, ToolbarItem } from './types';

export const TOOLBAR_ITEMS: Record<NodeType, ToolbarItem[]> = {
  [NodeType.TRIGGER]: [
    { type: NodeType.TRIGGER, blockType: BlockType.ORDER_UPDATE, iconName: 'ShoppingCart', label: 'Order Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.APPOINTMENT_UPDATE, iconName: 'Calendar', label: 'Appointment Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.DOCUMENT_UPDATE, iconName: 'FileText', label: 'Document/ Form Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.REPORT_UPDATE, iconName: 'ClipboardList', label: 'Report Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.TASK_UPDATE, iconName: 'CheckSquare', label: 'Task Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.PROFILE_UPDATE, iconName: 'User', label: 'Profile Update' },
    { type: NodeType.TRIGGER, blockType: BlockType.NEW_PATIENT, iconName: 'UserPlus', label: 'New Patient Created' },
    { type: NodeType.TRIGGER, blockType: BlockType.MANUAL, iconName: 'MousePointerClick', label: 'Manual' },
    { type: NodeType.TRIGGER, blockType: BlockType.SCHEDULED, iconName: 'Clock', label: 'Scheduled' },
  ],
  [NodeType.ACTION]: [
    { type: NodeType.ACTION, blockType: BlockType.SEND_MESSAGE, iconName: 'Mail', label: 'Send Message' },
    { type: NodeType.ACTION, blockType: BlockType.APPOINTMENT, iconName: 'Calendar', label: 'Appointment' },
    { type: NodeType.ACTION, blockType: BlockType.TASK, iconName: 'CheckSquare', label: 'Task' },
    { type: NodeType.ACTION, blockType: BlockType.DOCUMENT, iconName: 'FileText', label: 'Document' },
    { type: NodeType.ACTION, blockType: BlockType.ORDER, iconName: 'ShoppingCart', label: 'Order' },
    { type: NodeType.ACTION, blockType: BlockType.NOTE, iconName: 'StickyNote', label: 'Note' },
  ],
  [NodeType.LOGIC]: [
    { type: NodeType.LOGIC, blockType: BlockType.WAIT, iconName: 'Clock', label: 'Wait' },
    { type: NodeType.LOGIC, blockType: BlockType.REVIEW_APPROVAL, iconName: 'ShieldCheck', label: 'Review & Approval' },
    { type: NodeType.LOGIC, blockType: BlockType.CONDITIONAL, iconName: 'GitBranch', label: 'Conditional' },
    { type: NodeType.LOGIC, blockType: BlockType.LOOP, iconName: 'Repeat', label: 'Loop' },
  ]
};

// Map string names to actual components for rendering
export const ICON_MAP: Record<string, any> = {
  ShoppingCart, Calendar, FileText, ClipboardList, 
  CheckSquare, User, UserPlus, MousePointerClick, 
  Clock, Mail, AlertCircle, Repeat, GitBranch, 
  ShieldCheck, StickyNote
};
