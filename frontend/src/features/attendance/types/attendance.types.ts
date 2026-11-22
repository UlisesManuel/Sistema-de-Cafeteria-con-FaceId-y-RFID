
export type RfidStatus =
  | 'waiting'
  | 'success'
  | 'error';

export type AttendanceStatus =
  | 'WAITING_RFID'
  | 'WAITING_FACE'
  | 'VERIFYING_FACE'
  | 'SUCCESS'
  | 'REJECTED';

export interface CoordenadaRostro {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface RespuestaAPI {
  status: string;
  rostros_encontrados: number;
  identidad?: string;
  coordenadas: CoordenadaRostro[];
}
