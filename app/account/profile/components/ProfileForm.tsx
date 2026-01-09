"use client";

import SubmitButton from "@/app/_components/SubmitButton";
import { updateGuest } from "@/app/_lib/actions";
import { Guest } from "@/prisma/generated/client";
import { ReactNode } from "react";

export default function ProfileForm({
  children,
  guest,
}: {
  children: ReactNode;
  guest: Guest;
}) {
  const { fullName, email, nationalId, nationality, countryFlag, id } = guest;

  return (
    <form
      action={updateGuest}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col">
      <div className="hidden">
        <label htmlFor="guestId"></label>
        <input type="number" value={id} readOnly />
      </div>
      <div className="space-y-2">
        <label>Full name</label>
        <input
          name="fullName"
          defaultValue={fullName}
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <label>Email address</label>
        <input
          name="email"
          defaultValue={email}
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="nationality">Where are you from?</label>
          {/* <Image
              fill
              src={countryFlag}
              alt="Country flag"
              className="h-5 rounded-sm"
            /> */}
        </div>
        {children}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalId">National ID number</label>
        <input
          type="number"
          defaultValue={nationalId || ""}
          name="nationalId"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
      </div>
      <div className="flex justify-end items-center gap-6">
        <SubmitButton pendingLabel="Updating profile...">
          Update profile
        </SubmitButton>
      </div>
    </form>
  );
}
