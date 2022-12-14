import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { CustomResponse, Project } from '../utils/interfaces';
import { StatusCodes } from '../utils/constants';

let response: CustomResponse;

export async function updateUserAccessToken(walletAddress: string, objectId: string): Promise<CustomResponse> {

    const info = await prisma.users.upsert({
        create: {
            objectId: objectId,
            walletAddress: walletAddress
        },
        update: {
            walletAddress: walletAddress
        },
        where: {
            walletAddress: walletAddress
        }
    })

    // console.log(`info: ${JSON.stringify(info)}`);
    response = {
        success: true,
        message: 'The user access token is updated',
        code: StatusCodes.OK
    }
    return response;
}

export async function getUserAccessToken(walletAddress: string): Promise<CustomResponse> {

    const accessInfo = await prisma.users.findUnique({
        where: {
            walletAddress: walletAddress
        }
    });

    if  (accessInfo === null) {
        response = {
            success: false,
            message: 'User access token not found',
            code: StatusCodes.NotFound
        }
        
        await prisma.$disconnect();
        return response;
    }

    response = {
        success: true,
        data: { access: accessInfo.objectId },
        code: StatusCodes.OK
    }
    
    return response;
}

export async function increaseAdsCount(walletAddress: string): Promise<CustomResponse> {

    const info: any = await prisma.users.findUnique({
        where: {
            walletAddress: walletAddress
        }
    })

    if (info === null) {
        response = {
            success: false,
            message: 'user record with the device id not found',
            code: StatusCodes.NotFound
        }
        await prisma.$disconnect();
        return response;
    }

    let adsCount: number = info.adsCount + 1; // get it and add 1 to it
    let daoTokenCount = info.daoTokenCount;
    if (adsCount === 10) {
        daoTokenCount = info.daoTokenCount + 1;
        adsCount = 0;
    }

    await prisma.users.update({
       data: {
        adsCount: adsCount,
        daoTokenCount: daoTokenCount
       },
       where: {
        walletAddress: walletAddress
       }
    })

    response = {
        success: true,
        message: 'The user ads count is increased by 1',
        code: StatusCodes.OK
    }
    return response;
}

export async function getAdsTokenCount(walletAddress: string): Promise<CustomResponse> {

    const info: any = await prisma.users.findUnique({
        where: {
            walletAddress: walletAddress
        }
    })

    if (info === null) {
        response = {
            success: false,
            message: 'user record with the device id not found',
            code: StatusCodes.NotFound
        }
        await prisma.$disconnect();
        return response;
    }

    response = {
        success: true,
        data: { adsCount: info.adsCount, tokenCount: info.daoTokenCount },
        code: StatusCodes.OK
    }
    return response;
}

export async function resetTokenCount(walletAddress: string, amountToDeduct: number): Promise<CustomResponse> {
    const info: any = await prisma.users.findUnique({
        where: {
            walletAddress: walletAddress
        }
    })

    if (info === null) {
        response = {
            success: false,
            message: 'user record with the device id not found',
            code: StatusCodes.NotFound
        }
        await prisma.$disconnect();
        return response;
    }

    await prisma.users.update({
        data: {
            daoTokenCount: info.daoTokenCount - amountToDeduct
        },
        where: {
            walletAddress: walletAddress
        }
    })

    response = {
        success: true,
        message: 'The user token count is reset',
        code: StatusCodes.OK
    }
    return response;
}

export async function resetMovedTokenCount(walletAddresses: string[]): Promise<CustomResponse> {
    const info: any = await prisma.users.updateMany({
        where: {
            walletAddress: {
                in: walletAddresses
            }
        },
        data: {
            daoTokenCount: 0
        }
    })

    console.log(`updated many: ${JSON.stringify(info)}`);
    await prisma.$disconnect();

    // if (info === null) {
    //     response = {
    //         success: false,
    //         message: 'user record with the device id not found',
    //         code: StatusCodes.NotFound
    //     }
    //     await prisma.$disconnect();
    //     return response;
    // }

    response = {
        success: true,
        message: 'The moved token counts have been reset',
        code: StatusCodes.OK
    }
    return response;
}

export async function getTokensForTransfer(): Promise<CustomResponse> {

    const userInfo: any[] = await prisma.users.findMany();
    await prisma.$disconnect();
    
    if  (userInfo === null || userInfo.length === 0) {
        response = {
            success: false,
            message: 'No users in the exist at the moment',
            code: StatusCodes.NotFound
        }
        return response;
    }

    const bakers: string[] = [];
    const amounts: number[] = [];
    
    for (const user of userInfo) {
        if (user.daoTokenCount > 0) {
            bakers.push(user.walletAddress);
            amounts.push(user.daoTokenCount);
        }
    }

    response = {
        success: true,
        data: { bakers, amounts },
        code: StatusCodes.OK
    }

    return response;
}