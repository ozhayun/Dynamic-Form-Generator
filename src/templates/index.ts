import type { FormSchema } from '../types/schema'

export const RAW_EMPTY: FormSchema = []

export const TASK_DEFAULT: FormSchema = [
  {
    id: 'full_name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    validation: { required: true },
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@company.com',
    validation: {
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
  {
    id: 'role',
    type: 'select',
    label: 'Current Role',
    options: [
      { value: 'dev', label: 'Developer' },
      { value: 'manager', label: 'Manager' },
      { value: 'student', label: 'Student' },
    ],
    validation: { required: true },
  },
  {
    id: 'password',
    type: 'password',
    label: 'Create Password',
    validation: { required: true, minLength: 8 },
  },
  {
    id: 'bio',
    type: 'textarea',
    label: 'Short Bio',
    placeholder: 'Tell us about yourself...',
    validation: { maxLength: 300 },
  },
]

export const CONDITIONAL_LOGIC_DEMO: FormSchema = [
  {
    id: 'role',
    type: 'select',
    label: 'Current Role',
    options: [
      { value: 'dev', label: 'Developer' },
      { value: 'manager', label: 'Manager' },
      { value: 'student', label: 'Student' },
    ],
    validation: { required: true },
  },
  {
    id: 'team_size',
    type: 'number',
    label: 'How many people in your team?',
    visibility: {
      field: 'role',
      operator: 'equals',
      value: 'manager',
    },
    validation: { required: true },
  },
  {
    id: 'full_name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    validation: { required: true },
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@company.com',
    validation: {
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
]

export const CONTACT_FORM: FormSchema = [
  {
    id: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Your name',
    validation: { required: true },
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    validation: {
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
  {
    id: 'subject',
    type: 'select',
    label: 'Subject',
    options: [
      { value: 'support', label: 'Support' },
      { value: 'sales', label: 'Sales' },
      { value: 'feedback', label: 'Feedback' },
    ],
    validation: { required: true },
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'Message',
    placeholder: 'Your message...',
    validation: { required: true, maxLength: 500 },
  },
]

export const SURVEY_SHORT: FormSchema = [
  {
    id: 'satisfaction',
    type: 'select',
    label: 'How satisfied are you?',
    options: [
      { value: '1', label: 'Very dissatisfied' },
      { value: '2', label: 'Dissatisfied' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Satisfied' },
      { value: '5', label: 'Very satisfied' },
    ],
    validation: { required: true },
  },
  {
    id: 'comments',
    type: 'textarea',
    label: 'Additional comments',
    placeholder: 'Optional feedback...',
    validation: { maxLength: 200 },
  },
]

export const SIGNUP_MINIMAL: FormSchema = [
  {
    id: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'Choose a username',
    validation: { required: true, minLength: 3, maxLength: 20 },
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    validation: {
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
  {
    id: 'password',
    type: 'password',
    label: 'Password',
    validation: { required: true, minLength: 8 },
  },
]

export const NEWSLETTER_SUBSCRIBE: FormSchema = [
  {
    id: 'subscribe',
    type: 'select',
    label: 'Subscribe to Newsletter?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    visibility: {
      field: 'subscribe',
      operator: 'equals',
      value: 'yes',
    },
    validation: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
  {
    id: 'frequency',
    type: 'select',
    label: 'How often?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
    ],
    visibility: {
      field: 'email',
      operator: 'notEquals',
      value: '',
    },
  },
]

export const TEMPLATE_OPTIONS = [
  { id: 'raw', label: 'Raw', schema: RAW_EMPTY },
  { id: 'task-default', label: 'Task', schema: TASK_DEFAULT },
  { id: 'conditional-demo', label: 'Conditionals', schema: CONDITIONAL_LOGIC_DEMO },
  { id: 'newsletter', label: 'Newsletter', schema: NEWSLETTER_SUBSCRIBE },
  { id: 'contact', label: 'Contact', schema: CONTACT_FORM },
  { id: 'survey', label: 'Survey', schema: SURVEY_SHORT },
  { id: 'signup', label: 'Signup', schema: SIGNUP_MINIMAL },
] as const
