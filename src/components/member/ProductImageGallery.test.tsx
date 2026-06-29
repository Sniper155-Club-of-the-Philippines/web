import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductImageGallery from './ProductImageGallery';

const images = [
    {
        id: 'image-1',
        product_id: 'product-1',
        image_url: '/front.jpg',
        sort_order: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'image-2',
        product_id: 'product-1',
        image_url: '/back.jpg',
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
];

describe('ProductImageGallery', () => {
    it('lets members browse every product image', () => {
        render(<ProductImageGallery images={images} name='Club shirt' />);

        expect(
            screen.getByAltText('Club shirt image 1 of 2'),
        ).toBeInTheDocument();
        expect(screen.getByText('1 / 2')).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Show next product image',
            }),
        );

        expect(
            screen.getByAltText('Club shirt image 2 of 2'),
        ).toBeInTheDocument();
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    it('shows an image fallback for products without a gallery', () => {
        const { container } = render(
            <ProductImageGallery images={[]} name='Club shirt' />,
        );

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
