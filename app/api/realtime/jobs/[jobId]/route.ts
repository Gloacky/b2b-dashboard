import { NextRequest } from "next/server";
import {prisma} from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";