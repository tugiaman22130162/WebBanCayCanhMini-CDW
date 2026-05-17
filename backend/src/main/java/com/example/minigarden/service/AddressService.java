package com.example.minigarden.service;

import com.example.minigarden.repository.AddressRepository;
import com.example.minigarden.dto.AddressRequest;
import com.example.minigarden.entity.Address;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<Address> getAllByUserId(Integer userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Address getById(Integer id, Integer userId) {
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ!"));
    }

    @Transactional
    public Address create(Integer userId,AddressRequest request){

        if (request.getIsDefault() != null && request.getIsDefault()) {
            resetDefaultAddress(userId);
        }

        String fullAddress =
                request.getStreet() + ", "
                + request.getWard() + ", "
                + request.getDistrict() + ", "
                + request.getProvince();

        Address address = Address.builder()
                        .userId(userId)
                        .receiverName(
                                request.getReceiverName())
                        .phone(request.getPhone())
                        .province(request.getProvince())
                        .district(request.getDistrict())
                        .ward(request.getWard())
                        .street(request.getStreet())
                        .fullAddress(fullAddress)
                        .type(request.getType())
                        .provinceId(request.getProvinceId())
                        .districtId(request.getDistrictId())
                        .wardCode(request.getWardCode())
                        .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                        .build();

            address.setProvinceId(request.getProvinceId());
            address.setDistrictId(request.getDistrictId());
            address.setWardCode(request.getWardCode());

        return addressRepository.save(address);
    }

    @Transactional
    public Address update(Integer id, Integer userId, AddressRequest request) {
        Address address = getById(id, userId);

        if (request.getIsDefault() != null && request.getIsDefault() && !address.getIsDefault()) {
            resetDefaultAddress(userId);
        }

        String fullAddress = request.getStreet() + ", "
                + request.getWard() + ", "
                + request.getDistrict() + ", "
                + request.getProvince();

        address.setReceiverName(request.getReceiverName());
        address.setPhone(request.getPhone());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setStreet(request.getStreet());
        address.setFullAddress(fullAddress);
        address.setType(request.getType());
        
        address.setProvinceId(request.getProvinceId());
        address.setDistrictId(request.getDistrictId());
        address.setWardCode(request.getWardCode());
        
        if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        return addressRepository.save(address);
    }

    @Transactional
    public void delete(Integer id, Integer userId) {
        Address address = getById(id, userId);
        addressRepository.delete(address);
    }

    private void resetDefaultAddress(Integer userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(oldDefault -> {
            oldDefault.setIsDefault(false);
            addressRepository.save(oldDefault);
        });
    }
}
