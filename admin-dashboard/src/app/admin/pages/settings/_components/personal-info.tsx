"use client";

import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export interface UserInfo {
  name: string;
  phoneNumber?: string;
  email: string;
  bio?: string;
}

export function PersonalInfoForm(personalInfo: UserInfo) {
  const { name, phoneNumber = "", email, bio = "" } = personalInfo;

  if (!personalInfo.email) {
    return (
      <ShowcaseSection title="Personal Information" className="p-7!">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection title="Personal Information" className="p-7!">
      <p className="mb-5 text-sm text-dark-4 dark:text-dark-6">
        Chức năng cập nhật hồ sơ đang phát triển. Thông tin hiện tại chỉ xem.
      </p>
      <form>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="name"
            label="Full Name"
            placeholder="David Jhon"
            value={name}
            handleChange={() => {}}
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
            disabled
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phoneNumber"
            label="Phone Number"
            placeholder="+990 3343 7865"
            value={phoneNumber}
            handleChange={() => {}}
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
            disabled
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
          placeholder="devidjond45@gmail.com"
          value={email}
          handleChange={() => {}}
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
          disabled
        />

        <TextAreaGroup
          className="mb-5.5"
          name="bio"
          label="BIO"
          placeholder="Write your bio here"
          icon={<PencilSquareIcon />}
          value={bio}
          onChange={() => {}}
          disabled
        />
      </form>
    </ShowcaseSection>
  );
}
