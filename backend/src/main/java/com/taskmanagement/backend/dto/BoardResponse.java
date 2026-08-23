package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.Board;

import java.time.LocalDateTime;
import java.util.UUID;

public record BoardResponse(
        UUID id,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static BoardResponse from(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getName(),
                board.getCreatedAt(),
                board.getUpdatedAt()
        );
    }
}
