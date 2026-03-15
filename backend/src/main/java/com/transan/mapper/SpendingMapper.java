package com.transan.mapper;

import com.transan.dto.request.SpendingRequest;
import com.transan.dto.response.SpendingResponse;
import com.transan.entity.Spending;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SpendingMapper {

    SpendingResponse toResponse(Spending spending);

    List<SpendingResponse> toResponseList(List<Spending> spendings);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Spending toEntity(SpendingRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(SpendingRequest request, @MappingTarget Spending spending);
}
