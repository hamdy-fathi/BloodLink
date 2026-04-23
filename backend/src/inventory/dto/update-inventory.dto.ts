import { CreateInventoryDto } from './create-inventory.dto.js';

export class UpdateInventoryDto implements Partial<CreateInventoryDto> {
  type?: string;
  units?: number;
  trend?: string;
  expiringIn48h?: number;
}
