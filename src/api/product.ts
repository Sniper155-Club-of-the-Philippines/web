import type { AxiosInstance } from 'axios';
import type { Product, ProductImage } from '@/types/models/store';

export type ProductPayload = Pick<
    Product,
    'name' | 'slug' | 'description' | 'is_active' | 'sort_order'
>;

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ products: Product[] }>('/v1/products');
    return data.products;
}

export async function store(http: AxiosInstance, payload: ProductPayload) {
    const { data } = await http.post<{ product: Product }>(
        '/v1/products',
        payload,
    );
    return data.product;
}

export async function update(
    http: AxiosInstance,
    id: string,
    payload: ProductPayload,
) {
    const { data } = await http.put<{ product: Product }>(
        `/v1/products/${id}`,
        payload,
    );
    return data.product;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/products/${id}`);
}

export async function uploadImage(
    http: AxiosInstance,
    productId: string,
    image: File,
) {
    const formData = new FormData();
    formData.set('image', image);
    const { data } = await http.post<{ image: ProductImage }>(
        `/v1/products/${productId}/images`,
        formData,
    );
    return data.image;
}

export async function removeImage(
    http: AxiosInstance,
    productId: string,
    imageId: string,
) {
    await http.delete(`/v1/products/${productId}/images/${imageId}`);
}

export async function reorderImages(
    http: AxiosInstance,
    productId: string,
    images: ProductImage[],
) {
    const { data } = await http.put<{ images: ProductImage[] }>(
        `/v1/products/${productId}/images/reorder`,
        {
            images: images.map((image, sort_order) => ({
                id: image.id,
                sort_order,
            })),
        },
    );
    return data.images;
}
