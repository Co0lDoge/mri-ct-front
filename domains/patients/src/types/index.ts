import { BaseEntity } from '@medml/shared';

export interface Patient extends BaseEntity {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}


