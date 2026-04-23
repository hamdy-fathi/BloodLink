import { CreateDonorDto } from './create-donor.dto.js';

export class UpdateDonorDto implements Partial<CreateDonorDto> {
  name?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  age?: number;
  city?: string;
  lastDonation?: string;
  totalDonations?: number;
  reliability?: number;
  available?: boolean;
  eligible?: boolean;
}
