import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @function searchData
 * @description * 조건에 따라 검색 및 페이징 처리
 */
export const searchData = async (query: {
    title?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'title';
    order?: 'asc' | 'desc';
    page?: number; // 페이지 번호
    limit?: number; // 한 페이지에 표시할 개수
}) => {
    const {
        title,
        startDate,
        endDate,
        sortBy = 'createdAt',
        order = 'asc',
        page = 1,
        limit = 10,
    } = query;

    // 동적 필터링 조건 생성
    const where: any = {};
    if (typeof title === 'string') {
        where.title = title;
    }
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // 전체 데이터 개수 조회
    const totalCount = await prisma.document.count({ where });

    // 페이징 처리
    const d = await prisma.document.findMany({
        where,
        orderBy: {
            [sortBy]: order,
        },
        skip: (page - 1) * limit, // 페이지 시작점
        take: limit, // 표시할 개수
    });

    return { totalCount, data: d };
};