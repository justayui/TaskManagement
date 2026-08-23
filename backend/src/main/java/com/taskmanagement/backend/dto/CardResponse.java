package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.Card;

import java.time.LocalDateTime;
import java.util.UUID;

public record CardResponse(
        UUID id,
        UUID listId,
        String title,
        String description,
        int order,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getList().getId(),
                card.getTitle(),
                card.getDescription(),
                card.getOrder(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
