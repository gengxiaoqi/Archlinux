#!/bin/sh
# Under ROOT!!!

#confirm UEFI
ls /sys/firmware/efi/efivars

#check partition of disk
lsblk

parted -a optimal /dev/sdx
#------------------------------
#sda1 /mnt/boot/ 512Mb <- no need if Dual OS with win
#sda2 /mnt/root/ 20Gb
#sda3 swap 8Gb
#sda4 /mnt/home/
#------------------------------
mklabel gpt
(rm NUMBER)
unit mib
mkpart ESP fat32 1 513
name 1 boot
set 1 boot on
mkpart primary ext4 513 20993
mkpart primary linux-swap 20993 29185
mkpart primary ext4 29185 100%
print #list the partition
quit
#------------------------------

#format the disk
mkfs.fat -F32 /dev/sda1
mkfs.ext4 /dev/sda2
mkswap /dev/sda3
mkfs.ext4 /dev/sda4

#turn on the swap
swapon /dev/sda3

#mount
mount /dev/sda2 /mnt
mkdir -p /mnt/boot
mount /dev/sda1 /mnt/boot #<- change sda1 with EFI of Dual OS
mkdir -p /mnt/home
mount /dev/sda4 /mnt/home
mount -l #check

pacstrap -i /mnt base base-devel

genfstab -U -p /mnt >> /mnt/etc/fstab

arch-chroot /mnt #/bin/bash

nano /etc/locale.gen
#------------------------------
en.US.UTF-8 UTF-8
en.US ISO-8859-1
ja_JP.EUC-JP EUC-JP
ja_JP.UTF-8 UTF-8
zh_CN.GB18030 GB18030
zh_CN.GBK GBK
zh_CN.UTF-8 UTF-8
zh_CN GB2312
#------------------------------
locale-gen

tzselect

ln -s /usr/share/zoneinfo/ZONE/SUBZONE /etc/localtime

hwclock -w -u

(timedatectl set-ntp true) #enable and active network time synchronization

#create an initial ramdisk environment
mkinitcpio -p linux

echo HOSTNAME > /etc/hostname
nano /etc/hosts

passwd

bootctl install
bootctl update

#for mbr
#pacman -S grub
#grub-install --target=i386-pc /dev/sdx
#grub-mkconfig -o /boot/grub/grub.cfg

nano /boot/loader/loader.conf
#------------------------------
default Arch
timeout 3
editor 0
#------------------------------

#sdxY must be ROOT partition!!!
blkid -s PARTUUID -o value /dev/sdxY >> /boot/loader/entries/arch.conf
#------------------------------
title Arch Linux
linux /vmlinuz-linux
initrd /initramfs-linux.img
options root=PARTUUID=********-****-****-****-************ rw
#------------------------------

exit

umount -R /mnt

reboot

##############################

useradd -m -g users -G wheel -s /bin/bash USERNAME

passwd USERNAME

ip link

systemctl enable dhcpcd@INTERFACE.service
systemctl start dhcpcd@INTERFACE.service

nano /etc/sudoers
#------------------------------
%wheel ALL=(ALL) ALL
#------------------------------

##############################
git clone https://aur.archlinux.org/package-query.git
cd package-query
makepkg -si
cd
##############################
git clone https://aur.archlinux.org/yaourt.it
cd yaourt
makepkg -si
cd
##############################
#Control <-> Caps Lock in
#/usr/share/kbd/keymaps/i386/qwerty/us.map.gz
(loadkeys ***.map) #also can create a keymap file and load it

vim /etc/vconsole.conf
#------------------------------
FONT=ter-v28n
KEYMAP=us
FONT_MAP=8859-2
#------------------------------

sudo pacman -S refind-efi
refind-install
#rename /boot/EFI/Boot/bootx64.efi -> ***.bak
#rename /boot/EFI/systemd/systemd-bootx64.efi -> ***.bak
vim /boot/EFI/refind/refind.conf
#------------------------------
timeout 10
resolution 1920 1080
default selection 2
include themes/next-theme/theme.conf
#------------------------------

#set BIOS time is local time, 0 is BIOS->UTC
timedatectl set-local-rtc 1

#----------------------------------------
Git
git init
git clone "https://github.com/gengxiaoqi/***"
