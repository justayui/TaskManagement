package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CardResponse(
        UUID id,
        UUID listId,
        String title,
        String description,
        int order,
        Priority priority,
        LocalDate dueDate,
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
                card.getPriority(),
                card.getDueDate(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
