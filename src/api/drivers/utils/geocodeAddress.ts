import { api } from '../lib/api.js';
import 'dotenv/config';

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;

export interface GeoPoint {
  lat: number;
  lng: number;
}

const GEOCODE_API_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

export const geocodeAddress = async (address: string) => {
  const res = await api.get(GEOCODE_API_URL, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_CLIENT_ID}`,
    },
    params: {
      query: address,
      analyze_type: 'exact',
    },
  });

  return {
    lat: parseFloat(res.data.documents[0].y),
    lng: parseFloat(res.data.documents[0].x),
  };
};
